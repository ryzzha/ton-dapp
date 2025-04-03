import { Cell, fromNano, toNano } from "@ton/core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { Main } from '../wrappers/Main';
import { hex } from "../build/Main.compiled.json";
import '@ton/test-utils';

describe("main.fc contract tests", () => {
    let blockchain: Blockchain; 
    let mainContract: SandboxContract<Main>;
    let ownerWallet: SandboxContract<TreasuryContract>;
    let userWallet: SandboxContract<TreasuryContract>;
    let codeCell: Cell;

    beforeAll(async () => {
        codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
    })

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        ownerWallet = await blockchain.treasury("owner");
        userWallet = await blockchain.treasury("user");

        mainContract = blockchain.openContract(Main.createFromConfig({
            number: 5,
            address: userWallet.address,
            owner: ownerWallet.address,
        }, codeCell));
    })

    it("counter", async () => {

        const incrementMessageResult = await mainContract.sendChangeCounterMessage(userWallet.getSender(), toNano("0.01"), "increment", 6);

        expect(incrementMessageResult.transactions).toHaveTransaction({
            from: userWallet.address,
            to: mainContract.address,
            success: true,
        });

        const { number: number_1, recent_sender: recent_sender_1 } = await mainContract.getData();

        expect(number_1).toEqual(11);
        expect(recent_sender_1).toEqualAddress(userWallet.address);

        const decrementMessageResult = await mainContract.sendChangeCounterMessage(userWallet.getSender(), toNano("0.01"), "decrement", 3);

        expect(decrementMessageResult.transactions).toHaveTransaction({
            from: userWallet.address,
            to: mainContract.address,
            success: true,
        });

        const { number: number_2, recent_sender: recent_sender_2 } = await mainContract.getData();

        expect(number_2).toEqual(8);
        expect(recent_sender_2).toEqualAddress(userWallet.address);
    })

    it("succesfully deposit funds", async () => {
        const senderWallet = await blockchain.treasury("sender");

        const depositMessageResult = await mainContract.sendDepositMessage(senderWallet.getSender(), toNano("10"));

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: mainContract.address,
            success: true,
        });

        const { balance } = await mainContract.getBalance();

        expect(balance).toBeGreaterThanOrEqual(toNano("9.99"));
    })

    it("should return deposit funds if no command is send", async () => {
        const senderWallet = await blockchain.treasury("sender");

        const depositMessageResult = await mainContract.sendNoCodeDepositMessage(senderWallet.getSender(), toNano("10"));

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: mainContract.address,
            success: false,
        });

        const { balance } = await mainContract.getBalance();

        expect(balance).toBe(0);
    })

    it("succesfully withdraw funds if you are owner", async () => {
        const senderWallet = await blockchain.treasury("sender");

        const depositMessageResult = await mainContract.sendDepositMessage(senderWallet.getSender(), toNano("10"));

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: mainContract.address,
            success: true,
        });

        const withdrawMessageResult = await mainContract.sendWithdrawMessage(ownerWallet.getSender(), toNano("0.01"), toNano("7"));

        expect(withdrawMessageResult.transactions).toHaveTransaction({
            from: ownerWallet.address,
            to: mainContract.address,
            success: true,
        });

        expect(withdrawMessageResult.transactions).toHaveTransaction({
            from: mainContract.address,
            to: ownerWallet.address,
            success: true,
            value: toNano("7")
        });
    })

    it("fails to withdraw funds if you are not owner", async () => {
        const senderWallet = await blockchain.treasury("sender");

        const depositMessageResult = await mainContract.sendDepositMessage(senderWallet.getSender(), toNano("10"));

        expect(depositMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: mainContract.address,
            success: true,
            value: toNano("10")
        });

        const withdrawMessageResult = await mainContract.sendWithdrawMessage(senderWallet.getSender(), toNano("0.01"), toNano("7"));

        expect(withdrawMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: mainContract.address,
            success: false,
            exitCode: 103
        });
    })

    it("fails to withdraw funds because lack of balance", async () => {
        const withdrawMessageResult = await mainContract.sendWithdrawMessage(ownerWallet.getSender(), toNano("0.01"), toNano("5"));

        expect(withdrawMessageResult.transactions).toHaveTransaction({
            from: ownerWallet.address,
            to: mainContract.address,
            success: false,
            exitCode: 104
        });
    })
}) 
