import { address, Cell, toNano } from '@ton/core';
import { Main } from '../wrappers/Main';
import { NetworkProvider } from '@ton/blueprint';
import { hex } from "../build/Main.compiled.json";

export async function run(provider: NetworkProvider) {
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
 
    const myContract = Main.createFromConfig({
        number: 0,
        address: address("0QCsVmoQBfBjqaTkvJ57Q86G9XWtv1E5Zyl8n64ALBN0YkcF"),
        owner: address("0QCsVmoQBfBjqaTkvJ57Q86G9XWtv1E5Zyl8n64ALBN0YkcF")
    }, codeCell);

    const openedContract = provider.open(myContract); 

    await openedContract.sendDeploy(provider.sender(), toNano("0.05"));

    await provider.waitForDeploy(myContract.address);
}

/// my mainnet address -> UQCGhs01cudLVBdZCEeJB_xf8GVQvtGm7VjT5tJ8wYER_RzH
/// my testnet address -> 0QCsVmoQBfBjqaTkvJ57Q86G9XWtv1E5Zyl8n64ALBN0YkcF
/// contract address -> kQDepTzaGaFpkKWoyAOJKy48EGujZJ-gzuCVspwKnXZ9v2Dv 