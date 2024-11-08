const { Shim } = require('fabric-shim');
const { ChaincodeMockStub, Transform } = require('@theledger/fabric-mock-stub');
const AssetTransfer = require('../index');
const chai = require('chai');
const expect = chai.expect;

describe('AssetTransfer', () => {
    let assetTransfer;
    let stub;

    beforeEach(() => {
        assetTransfer = new AssetTransfer();
        stub = new ChaincodeMockStub('AssetTransfer', assetTransfer);
    });

    it('should initialize the ledger with assets', async () => {
        await stub.mockInit('tx1', []);
        const asset1 = Transform.bufferToObject(await stub.getState('asset1'));
        const asset2 = Transform.bufferToObject(await stub.getState('asset2'));

        expect(asset1).to.deep.equal({
            ID: 'asset1',
            Color: 'blue',
            Size: 5,
            Owner: 'Tomoko',
            AppraisedValue: 300,
        });

        expect(asset2).to.deep.equal({
            ID: 'asset2',
            Color: 'red',
            Size: 10,
            Owner: 'Brad',
            AppraisedValue: 400,
        });
    });

    it('should create a new asset', async () => {
        await stub.mockInit('tx1', []);
        await stub.mockInvoke('tx2', ['CreateAsset', 'asset3', 'green', '15', 'Alice', '500']);
        const asset3 = Transform.bufferToObject(await stub.getState('asset3'));

        expect(asset3).to.deep.equal({
            ID: 'asset3',
            Color: 'green',
            Size: 15,
            Owner: 'Alice',
            AppraisedValue: 500,
        });
    });

    it('should read an existing asset', async () => {
        await stub.mockInit('tx1', []);
        await stub.mockInvoke('tx2', ['CreateAsset', 'asset3', 'green', '15', 'Alice', '500']);
        const asset3 = await stub.mockInvoke('tx3', ['ReadAsset', 'asset3']);
        const asset3JSON = Transform.bufferToObject(asset3.payload);

        expect(asset3JSON).to.deep.equal({
            ID: 'asset3',
            Color: 'green',
            Size: 15,
            Owner: 'Alice',
            AppraisedValue: 500,
        });
    });

    it('should throw an error for a non-existent asset', async () => {
        await stub.mockInit('tx1', []);
        try {
            await stub.mockInvoke('tx2', ['ReadAsset', 'nonexistent']);
        } catch (err) {
            expect(err.message).to.equal('The asset nonexistent does not exist');
        }
    });
});