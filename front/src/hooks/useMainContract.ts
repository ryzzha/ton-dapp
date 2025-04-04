import { useState, useEffect } from "react";
import { Main } from "../contracts/Main";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract, toNano } from "ton-core";
import { useTonConnect } from "./useTonConnect";

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time))

export function useMainContract() {
    const client = useTonClient();
    const { sender } = useTonConnect();
    const [contractData, setContractData] = useState<null | {
        counter: number;
        sender: Address;
        owner: Address;
    }>();
    const [balance, setBalance] = useState<null | number>(0);

    const mainContract = useAsyncInitialize(async () => {
        if(!client) return;

        const contract = new Main(Address.parse("kQDepTzaGaFpkKWoyAOJKy48EGujZJ-gzuCVspwKnXZ9v2Dv"));
        return client.open(contract) as OpenedContract<Main>;
    }, [client]);

    useEffect(() => {
        async function getData() {
            if(!mainContract) return;
            const { counter, sender, owner } = await mainContract.getData();
            const balance = await mainContract.getBalance();
            setContractData({
                counter, sender, owner
            });
            setBalance(balance);
            await sleep(10000);
            getData()
            console.log("getData work")
        }
        getData();
    }, [mainContract])

    return {
        address: mainContract?.address.toString(),
        balance,
        ...contractData,
        sendChangeIncrement: async (amount: number, operation: "increment" | "decrement") => {
            return mainContract?.sendChangeCounterMessage(sender, toNano("0.01"), operation, amount);
        },
        sendDeposit: async (amount: number) => {
            return mainContract?.sendDepositMessage(sender, toNano(amount));
        },
        sendWithdraw: async (amount: number) => {
            return mainContract?.sendWithdrawMessage(sender, toNano("0.01"), toNano(amount));
        }
    }
}