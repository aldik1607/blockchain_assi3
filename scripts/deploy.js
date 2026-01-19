import { ethers } from "ethers";
import * as dotenv from "dotenv";
import fs from "fs";

dotenv.config();

async function main() {
    // 1. Настройка подключения
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("Деплой с кошелька:", wallet.address);

    // 2. Загрузка данных контракта (артефактов)
    // После npx hardhat compile файл появляется тут:
    const artifactPath = "./artifacts/contracts/MyToken.sol/MyToken.json";
    if (!fs.existsSync(artifactPath)) {
        throw new Error("Файл контракта не найден. Сначала запустите: npx hardhat compile");
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // 3. Создание фабрики и деплой
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    
    console.log("Отправка транзакции...");
    const contract = await factory.deploy();
    
    console.log("Ожидание деплоя (это может занять 30-60 секунд)...");
    await contract.waitForDeployment();

    console.log("---------------------------------------");
    console.log("УСПЕХ!");
    console.log("Адрес токена:", await contract.getAddress());
    console.log("---------------------------------------");
}

main().catch((error) => {
    console.error("Ошибка:", error);
    process.exit(1);
});