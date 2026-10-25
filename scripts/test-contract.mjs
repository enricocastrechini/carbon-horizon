import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import solc from 'solc';
import { createVM, buildBlock } from '@ethereumjs/vm';
import { createCustomCommon, Mainnet, Hardfork } from '@ethereumjs/common';
import { createLegacyTx } from '@ethereumjs/tx';
import { createBlock } from '@ethereumjs/block';
import { createAccount, createAddressFromPrivateKey, bytesToHex, hexToBytes } from '@ethereumjs/util';
import { Interface, id, AbiCoder } from 'ethers';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('contracts/EvidenceRegistry.sol', root), 'utf8');
const input = { language: 'Solidity', sources: { 'EvidenceRegistry.sol': { content: source } }, settings: { evmVersion: 'shanghai', outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } } };
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = output.errors?.filter(item => item.severity === 'error') || [];
assert.equal(errors.length, 0, JSON.stringify(errors));
const artifact = output.contracts['EvidenceRegistry.sol'].EvidenceRegistry;
const common = createCustomCommon({ chainId: 1337 }, Mainnet, { hardfork: Hardfork.Shanghai });
const vm = await createVM({ common });
const abi = new Interface(artifact.abi);
// Deterministic throwaway keys are exclusively for this in-memory test chain.
const operator = hexToBytes(`0x${'11'.repeat(32)}`);
const reviewer = hexToBytes(`0x${'22'.repeat(32)}`);
for (const key of [operator, reviewer]) {
  await vm.stateManager.putAccount(createAddressFromPrivateKey(key), createAccount({ balance: 10n ** 22n }));
}
let parent = createBlock({ header: { number: 0n, gasLimit: 30_000_000n, baseFeePerGas: 1n, timestamp: 1n } }, { common, skipConsensusFormatValidation: true });
let contract;
async function transact(key, data, destination) {
  const sender = createAddressFromPrivateKey(key);
  const account = await vm.stateManager.getAccount(sender);
  const tx = createLegacyTx({ nonce: account.nonce, gasLimit: 5_000_000n, gasPrice: 10n, data: hexToBytes(data), ...(destination ? { to: destination } : {}) }, { common }).sign(key);
  const builder = await buildBlock(vm, { parentBlock: parent, headerData: { number: parent.header.number + 1n, timestamp: parent.header.timestamp + 1n, gasLimit: 30_000_000n, baseFeePerGas: 1n }, blockOpts: { putBlockIntoBlockchain: false, skipConsensusFormatValidation: true } });
  const result = await builder.addTransaction(tx);
  const { block } = await builder.build();
  parent = block;
  if (result.execResult.exceptionError) throw new Error(`EVM reverted: ${result.execResult.exceptionError.error}`);
  return { result, hash: bytesToHex(tx.hash()), blockNumber: Number(block.header.number), blockHash: bytesToHex(block.hash()), status: 1, gasUsed: result.totalGasSpent.toString() };
}
const constructorArgs = AbiCoder.defaultAbiCoder().encode(['address'], [createAddressFromPrivateKey(reviewer).toString()]);
const deployment = await transact(operator, `0x${artifact.evm.bytecode.object}${constructorArgs.slice(2)}`);
contract = deployment.result.createdAddress;
assert.ok(contract, 'Deployment must create a contract');
const send = (key, method, args) => transact(key, abi.encodeFunctionData(method, args), contract);
async function call(method, args) {
  const result = await vm.evm.runCall({ caller: createAddressFromPrivateKey(operator), to: contract, data: hexToBytes(abi.encodeFunctionData(method, args)) });
  assert.equal(result.execResult.exceptionError, undefined);
  return abi.decodeFunctionResult(method, bytesToHex(result.execResult.returnValue))[0];
}
const bytes = await readFile(new URL('public/pilot/result.json', root));
const report = JSON.parse(bytes.toString('utf8'));
for (const [name, expected] of Object.entries(report.files)) {
  const file = await readFile(new URL(`public/pilot/${name}`, root));
  assert.equal(createHash('sha256').update(file).digest('hex'), expected, `Output checksum: ${name}`);
}
const digest = `0x${createHash('sha256').update(bytes).digest('hex')}`;
const project = id('rhodes-2023-pilot|2023|spectral-demo-v1|TEST-ONLY');
const checks = [];
async function rejected(name, action) {
  await assert.rejects(action, /EVM reverted/);
  checks.push({ name, passed: true });
}
await rejected('Cannot approve absent evidence', () => send(reviewer, 'approve', [digest]));
await rejected('Reject an empty digest', () => send(operator, 'anchor', [`0x${'00'.repeat(32)}`]));
const anchorReceipt = await send(operator, 'anchor', [digest]);
assert.equal(await call('anchored', [digest]), true);
const anchorEvent = abi.parseLog({ topics: anchorReceipt.result.receipt.logs[0][1].map(bytesToHex), data: bytesToHex(anchorReceipt.result.receipt.logs[0][2]) });
assert.equal(anchorEvent.args.digest, digest);
assert.equal(anchorEvent.args.submitter.toLowerCase(), createAddressFromPrivateKey(operator).toString());
await rejected('Reject duplicate anchoring', () => send(operator, 'anchor', [digest]));
await rejected('Reviewer role is enforced', () => send(operator, 'approve', [digest]));
await rejected('Issuance requires review', () => send(reviewer, 'issue', [project, digest, 1]));
const reviewReceipt = await send(reviewer, 'approve', [digest]);
await rejected('Issuance requires reviewer role', () => send(operator, 'issue', [project, digest, 1]));
await rejected('Reject zero-unit issuance', () => send(reviewer, 'issue', [project, digest, 0]));
const issueReceipt = await send(reviewer, 'issue', [project, digest, 1]);
await rejected('Reject duplicate project/vintage issuance', () => send(reviewer, 'issue', [project, digest, 1]));
await rejected('Reject reusing evidence under another project key', () => send(reviewer, 'issue', [id('other-project'), digest, 1]));
await rejected('Retirement requires reviewer role', () => send(operator, 'retire', [project, 1]));
const retirementReceipt = await send(reviewer, 'retire', [project, 1]);
assert.equal(await call('outstanding', [project]), 0n);
assert.equal(await call('retired', [project]), 1n);
await rejected('Reject reuse after retirement', () => send(reviewer, 'retire', [project, 1]));
const altered = `0x${createHash('sha256').update(Buffer.concat([bytes, Buffer.from(' ')])).digest('hex')}`;
assert.equal(await call('anchored', [altered]), false);
checks.push({ name: 'Altered report does not match the anchored digest', passed: true });
const receipt = {
  schema: 'carbon-horizon-local-chain/v1', network: 'Ephemeral local EthereumJS EVM', chainId: 1337,
  publicTestnet: false, ephemeral: true, contract: contract.toString(),
  reportSha256: digest.slice(2), contractSourceSha256: createHash('sha256').update(source).digest('hex'),
  compiler: solc.version(), projectVintage: project, testUnitsIssued: 1,
  outstanding: 0, retired: 1,
  transactions: [anchorReceipt, reviewReceipt, issueReceipt, retirementReceipt].map((r, index) => ({ action: ['Anchor', 'Approve', 'Issue test unit', 'Retire test unit'][index], hash: r.hash, blockNumber: r.blockNumber, blockHash: r.blockHash, status: r.status, gasUsed: r.gasUsed })),
  checks,
  note: 'Recorded from actual signed transactions in locally built EVM blocks. In-memory state is discarded after the run; rerun to verify. One arbitrary test unit is used for mechanics, not a carbon quantity. No public-chain anchoring or accredited review.'
};
if (process.argv.includes('--write-receipt')) {
  const destination = new URL('public/pilot/local-chain.json', root);
  await writeFile(destination, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`Local execution receipt: ${fileURLToPath(destination)}`);
} else {
  const published = JSON.parse(await readFile(new URL('public/pilot/local-chain.json', root), 'utf8'));
  assert.equal(published.reportSha256, receipt.reportSha256, 'Stale report receipt: run npm run demo:receipt');
  assert.equal(published.contractSourceSha256, receipt.contractSourceSha256, 'Stale contract receipt: run npm run demo:receipt');
  assert.deepEqual(published.transactions, receipt.transactions, 'Published transactions must reproduce exactly');
}
console.log(`Contract checks passed: ${checks.length}; issue/retire transactions confirmed on local EVM.`);
