
var mineflayer = require('mineflayer');
const mineflayerViewer = require('prismarine-viewer').mineflayer;
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
let mcData
var goal;



var bot = mineflayer.createBot({
  host: "192.168.1.240",
  port: "25565",   
  username: "Dream",
  version: "1.17.1"
})

bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(require('mineflayer-collectblock').plugin);

bot.once('login', async (err) => {
    mcData = require('minecraft-data')(bot.version);
    bot.on('chat', (username, message) => {
        if (username === bot.username) return
        if (message == 'come') {
            bot.chat('ok');
            const target = bot.players[username]?.entity
            if (!target) return bot.chat("I don't see you !");
            bot.pvp.attack(target);
        } else if (/give me [a-z]+/i.test(message)) {
            bot.chat('ok');
            const diamondOre = bot.findBlock({
                matching: mcData.blocksByName[message.split(' ')[2]].id,
                maxDistance: 4000
            });
            if (diamondOre)bot.collectBlock.collect(diamondOre, () => bot.chat('done!'));
            else bot.chat('did not find any.');
        } else if (/go mine [0-9]+ (ore(|s)|block(|s))/i.test(message)) {
            bot.chat('ok');
            collect(message.split(' ')[2]);
        } else if (message == "stop") {
            bot.chat('ok');
            try {
                bot.pvp.stop();
            } catch {
                bot.chat("no can do");
            }
        } else if (message == "go speedrun") {
            bot.chat('ok');


        }
    });
    bot.on('entityHurt', async entity => {
        if (bot.entity != entity)return;
        bot.chat('OW!');
        const other = bot.nearestEntity(near => near.position.distanceTo(bot.entity.position) < 10 && (near.type == 'mob' || near.type == 'player'));
        if (!other)return;
        bot.pvp.attack(other);
        if (goal)bot.collectBlock.collect(goal, err=> console.log(err ? err : 'it worked'));
    });
    bot.on('goal_update', thing => goal = thing);
    mineflayerViewer(bot, { port: 3000 }) 
});

const collect = (times) => {
    const ore = bot.findBlock({
        matching: ['coal_ore', 'deepslate_coal_ore', 'copper_ore', 'deepslate_copper_ore', 'iron_ore', 'deepslate_iron_ore', 'redstone_ore', 'deepslate_redstone_ore', 'diamond_ore', 'deepslate_diamond_ore', 'lapis_ore', 'deepslate_lapis_ore', 'emerald_ore', 'deepslate_emerald_ore'].map(ore => mcData.blocksByName[ore].id),
        maxDistance: 200
    });
    bot.collectBlock.collect(ore, err => {
        if (!times)return bot.chat('done!');
        collect(times-1);
    });

}