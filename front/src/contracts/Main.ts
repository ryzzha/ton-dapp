import { Contract, Address, Cell, beginCell, contractAddress, ContractProvider, Sender, SendMode } from "ton-core"; // @ton/core

interface MainContractConfig {
    number: number;
    address: Address;
    owner: Address;
}

export function mainContractConfigToCell(config: MainContractConfig): Cell {
    const { number, address, owner } = config;
    return beginCell().storeUint(number, 32).storeAddress(address).storeAddress(owner).endCell();
}

export class Main implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell, data: Cell }
    ) {}

    static createFromConfig(config: MainContractConfig, code: Cell, workchain = 0) {
        const data = mainContractConfigToCell(config);
        const init = { code, data };
        const address = contractAddress(workchain, init);

        return new Main(address, init);
    }

    async sendDeploy(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(3,32).endCell()
        })
    }

    async sendChangeCounterMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        operation: "increment" | "decrement",
        amount: number
    ) {
        const op = operation == "increment" ? 1 : 2;
        const msg_body = beginCell().storeUint(op, 32).storeUint(amount, 32).endCell();
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        })
    }

    async sendDepositMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        const msg_body = beginCell().storeUint(3,32).endCell();
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        })
    }

    async sendNoCodeDepositMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        const msg_body = beginCell().endCell();
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        })
    }

    async sendWithdrawMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        amount: bigint
    ) {
        const msg_body = beginCell().storeUint(4,32).storeCoins(amount).endCell();
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        })
    }

    async getData(provider: ContractProvider) {
        const { stack } = await provider.get("get_contract_storage_data", []);
        return {
            counter: stack.readNumber(),
            sender: stack.readAddress(),
            owner: stack.readAddress()
        }
    }

    async getBalance(provider: ContractProvider) {
        const { stack } = await provider.get("balance", []);
        return stack.readNumber()
    }
}