import { Telegraf, Context } from "telegraf";
import 'dotenv/config';
import { beginCell, toNano } from "ton-core";

interface MySession {
    step?: string;
    actionType?: string;
}

interface MyContext extends Context {
    session: MySession;
}

const bot = new Telegraf<MyContext>(process.env.TG_BOT_TOKEN!);

const mainAddress = "kQDepTzaGaFpkKWoyAOJKy48EGujZJ-gzuCVspwKnXZ9v2Dv";

const sessions = new Map<number, MySession>();

bot.use((ctx, next) => {
    const chatId = ctx.chat?.id;
    if (chatId) {
        if (!sessions.has(chatId)) sessions.set(chatId, {});
        ctx.session = sessions.get(chatId)!;
    }
    return next();
});

bot.start((ctx) =>
    ctx.reply("welcome to bot for interaction with contract app:)", {
        reply_markup: {
            keyboard: [
                ["Change counter"],
                ["Deposit ton"],
                ["Withdraw ton"],
            ],
        },
    })
);

bot.hears("Change counter", (ctx) => {
    ctx.reply("Choose option", {
        reply_markup: {
            keyboard: [
                ["Increment"],
                ["Decrement"],
            ],
        },
    })
});

bot.hears("Increment", (ctx) => {
    ctx.session.step = "awaiting_value";
    ctx.session.actionType = "Increment";
    ctx.reply("🔢 Введи значення, на яке інкрементувати:");
});

bot.hears("Decrement", (ctx) => {
    ctx.session.step = "awaiting_value";
    ctx.session.actionType = "Decrement";
    ctx.reply("🔢 Введи значення, на яке декрементувати:");
});

bot.hears("Deposit ton", (ctx) => {
    ctx.session.step = "awaiting_value";
    ctx.session.actionType = "Deposit";
    ctx.reply("🔢 Введи суму для депозиту:");
});

bot.hears("Withdraw ton", (ctx) => {
    ctx.session.step = "awaiting_value";
    ctx.session.actionType = "Withdraw";
    ctx.reply("🔢 Введи суму для виведення:");
});


bot.on("text", (ctx) => {
    const session = ctx.session;
    const input = ctx.message.text;

    if (session.step === "awaiting_value" && session.actionType === "Increment") {
        const userInput = input.trim();
        const amount = Number(userInput);

        if (isNaN(amount) || amount <= 0) {
            ctx.reply("❌ Введи коректне число.");
            return;
        }
      
        const tonLink = createTonChangeCounterLink(mainAddress, "increment", amount);
      
        ctx.reply(`📝 Натисни для підтвердження дії:`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Sign increment transaction in tonkeeper wallet",
                            url: tonLink
                        }
                    ]
                ]
            },
        });
      
        session.step = undefined;
        session.actionType = undefined;
      }

      if (session.step === "awaiting_value" && session.actionType === "Decrement") {
        const userInput = input.trim();
        const amount = Number(userInput);

        if (isNaN(amount) || amount <= 0) {
            ctx.reply("❌ Введи коректне число.");
            return;
        }
      
        const tonLink = createTonChangeCounterLink(mainAddress, "decrement", amount);
      
        ctx.reply(`📝 Натисни для підтвердження дії:`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Sign decrement transaction in tonkeeper wallet",
                            url: tonLink
                        }
                    ]
                ]
            },
        });
      
        session.step = undefined;
        session.actionType = undefined;
      }
      

    if (session.step === "awaiting_value" && session.actionType == "Deposit") {
        const userInput = input.trim();
        const amount = Number(userInput);

        if (isNaN(amount) || amount <= 0) {
            ctx.reply("❌ Введи коректне число.");
            return;
        }

        const depositLink = createDepositLink(mainAddress, amount);

        ctx.reply(`📝 Натисни для підтвердження дії:`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Sign deposit transaction in tonkeeper wallet",
                            url: depositLink
                        }
                    ]
                ]
            },
        });

        session.step = undefined;
        session.actionType = undefined;
    }

    if (session.step === "awaiting_value" && session.actionType == "Withdraw") {
        const userInput = input.trim();
        const amount = Number(userInput);

        if (isNaN(amount) || amount <= 0) {
            ctx.reply("❌ Введи коректне число.");
            return;
        }

        const withdrawLink = createWithdrawLink(mainAddress, amount);

        ctx.reply(`📝 Натисни для підтвердження дії:`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Sign withdraw transaction in tonkeeper wallet",
                            url: withdrawLink
                        }
                    ]
                ]
            },
        });

        session.step = undefined;
        session.actionType = undefined;
    }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));


function createTonChangeCounterLink(to: string, operation: "increment" | "decrement", amount: number) {
    const op = operation === "increment" ? 1 : 2;
    const cell = beginCell()
        .storeUint(op, 32)
        .storeUint(amount, 32)
        .endCell();

    console.log("createTonChangeCounterLink WORK")
    console.log("cell -> " + cell)

    const boc = cell.toBoc({ idx: false });
    console.log("boc -> " + boc)
    const binBase64 = Buffer.from(boc).toString("base64url");
    console.log("binBase64 -> " + binBase64)
    const amountNano = toNano("0.01").toString(10);

    const url = new URL(`https://app.tonkeeper.com/transfer/${to}`);
    url.searchParams.set("amount", amountNano);
    url.searchParams.set("bin", binBase64);
    return url.toString();
}

function createDepositLink(to: string, amountTon: number) {
    const cell = beginCell()
        .storeUint(3, 32)
        .endCell();

    console.log("createDepositLink WORK")
    console.log("cell -> " + cell)

    const boc = cell.toBoc({ idx: false });
    console.log("boc -> " + boc)
    const binBase64 = Buffer.from(boc).toString("base64url");
    console.log("binBase64 -> " + binBase64)

    const amountNano = toNano(amountTon).toString(10);

    const url = new URL(`https://app.tonkeeper.com/transfer/${to}`);
    url.searchParams.set("amount", amountNano);
    url.searchParams.set("bin", binBase64); 
    return url.toString();
}

function createWithdrawLink(to: string, amountTon: number) {
    const cell = beginCell()
        .storeUint(4, 32)
        .storeCoins(toNano(amountTon))
        .endCell();

    console.log("createWithdrawLink WORK")
    console.log("cell -> " + cell)

    const boc = cell.toBoc({ idx: false });
    console.log("boc -> " + boc)
    const binBase64 = Buffer.from(boc).toString("base64url");
    console.log("binBase64 -> " + binBase64)

    const amountNano = toNano("0.01").toString(10);

    const url = new URL(`https://app.tonkeeper.com/transfer/${to}`);
    url.searchParams.set("amount", amountNano);
    url.searchParams.set("bin", binBase64); 
    return url.toString();
}