class Item {
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
    use() {
        // Use item
    }
}

class HealthPotion extends Item {
    constructor() {
        super('Health Potion', 5);
        this.healingAmount = 10;
    }

    use(player) {
        player.heal(this.healingAmount);
    }
}

class Inventory {
    constructor() {
        this.items = [];
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(item) {
        this.items.splice(this.items.indexOf(item), 1);
    }

    useItem(item, player) {
        if (this.items.includes(item)) {
            player.useItem(item);
            this.removeItem(item);
        }
    }
}

class Weapon extends Item {
    constructor(name, damage, modifier, price) {
        super(name, price);
        this.damage = damage;
        this.modifier = modifier;
    }
}

class Armor extends Item {
    constructor(name, defense, price) {
        super(name, price);
        this.defense = defense;
    }
}

class PlayerClass {
    constructor(name, constitution, strength, dexterity, intelligence, starterWeapon, starterArmor) {
        this.name = name;
        this.constitution = constitution;
        this.strength = strength;
        this.dexterity = dexterity;
        this.intelligence = intelligence;
        this.starterWeapon = starterWeapon;
        this.starterArmor = starterArmor;
    }
}

class Character {
    constructor(name, weapon, armor, maxHealth, inventory) {
        this.name = name;
        this.maxHealth = maxHealth;
        this.health = this.maxHealth;
        this.weapon = weapon;
        this.armor = armor;
        this.inventory = inventory;
    }
    attack() {
        // Attack
    }
    takeDamage(damage) {
        // Take damage
        this.health -= damage;
        if (this.health <= 0) {
            this.die();
        }
    }
    die() {
        // Die
        currentQuest.end();
    }
}

class Player extends Character {
    constructor(name, weapon, armor, maxHealth, inventory, playerClass) {
        super(name, weapon, armor, maxHealth, inventory);
        this.class = playerClass;
        this.health = maxHealth;
    }

    useItem(item) {
        item.use(this);

    }

    usePotion() {
        // Use potion
        if (this.inventory.items.length > 0) {
            this.inventory.useItem(this.inventory.items[0], this);
            // Update HTML player card info
            document.querySelector('.PlayerCard__hp').innerHTML = this.health;
            document.querySelector('.PlayerCard__potions').innerHTML = this.inventory.items.length;
        }
    }

    attack() {
        // Attack
        currentQuest.enemy.takeDamage(this.weapon.damage + this.class[this.weapon.modifier]);
    }

    takeDamage(damage) {
        // Take damage
        this.health -= damage - this.armor.defense;
        // Update HTML player card info
        document.querySelector('.PlayerCard__hp').innerHTML = this.health;
        if (this.health <= 0) {
            this.die();
        }

    }

    heal(amount) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }

    static getPlayer(event) {
        event.preventDefault();

        //create player
        player = new Player(
            event.target.name.value,
            classes[event.target.class.value].starterWeapon,
            classes[event.target.class.value].starterArmor,
            classes[event.target.class.value].constitution,
            new Inventory(classes[event.target.class.value].starterWeapon, classes[event.target.class.value].starterArmor),
            classes[event.target.class.value]
        );

        //update html player card info
        document.querySelector('.PlayerCard__name').innerHTML = player.name;
        document.querySelector('.PlayerCard__class').innerHTML = player.class.name;
        document.querySelector('.PlayerCard__hp').innerHTML = player.health;
        document.querySelector('.PlayerCard__armor').innerHTML = player.armor.defense;
        document.querySelector('.PlayerCard__damage').innerHTML = player.weapon.damage + player.class[player.weapon.modifier];
        document.querySelector('.PlayerCard__weapon').innerHTML = player.weapon.name;

        //continue game
        game.continue();
    }
}

class Enemy extends Character {
    constructor(name, weapon, armor, maxHealth, inventory, type) {
        super(name, weapon, armor, maxHealth, inventory);
        this.type = type;
        this.health = maxHealth;
    }

    attack() {
        // Attack
        player.takeDamage(this.weapon.damage);
    }

    takeDamage(damage) {
        // Take damage
        this.health -= damage;
        // Update HTML quest info
        document.querySelector('.main').innerHTML = `
        <h1>${currentQuest.name}</h1>
        <p>${currentQuest.description}</p>
        <p>Enemy: ${this.name}</p>
        <p>Health: ${this.health}/${this.maxHealth}</p>
        <button onclick="player.attack(this)">Attack</button>
        <button onclick="player.usePotion()">Use Potion</button>`
        if (this.health <= 0) {
            this.die();
            return;
        }
        this.attack();
    }
}

class Quest {
    constructor(name, description, enemy, reward) {
        this.name = name;
        this.description = description;
        this.enemy = enemy;
        this.reward = reward;
    }
    start() {
        // Start quest
        this.enemy.health = this.enemy.maxHealth;
        // Update HTML quest info
        document.querySelector('.main').innerHTML = `
        <h1>${this.name}</h1>
        <p>${this.description}</p>
        <p>Enemy: ${this.enemy.name}</p>
        <p>Health: ${this.enemy.health}/${this.enemy.maxHealth}</p>
        <button onclick="player.attack(this.enemy)">Attack</button>
        <button onclick="player.usePotion()">Use Potion</button>`
    }
    end() {
        // End quest
        if (player.health <= 0) {
            //prompt player died
            alert('You died!');
            game.end();
        }
        else {
            // Prompt quest complete
            alert(`Quest complete! You received a ${this.reward.name}`);
            // Add reward to player inventory
            player.inventory.addItem(this.reward);
            document.querySelector('.PlayerCard__potions').innerHTML = player.inventory.items.length;
            // Update HTML player card info
            document.querySelector('.PlayerCard__hp').innerHTML = player.health;

            // Ask if the player wants to use a potion
            if (player.inventory.items.length > 0) {
                const usePotion = confirm('Do you want to use a potion?');
                if (usePotion) {
                    // Use the first potion in the inventory
                    player.usePotion();
                    // Update HTML player card info
                    document.querySelector('.PlayerCard__hp').innerHTML = player.health;
                }
            }
            //continue game
            game.continue();
        }
    }
}

class GameProgress {
    // constructor() {
    //     this.quests = [];
    // }
    start() {
        // Reset player
        player = null;
        // Start game use prompt
        document.querySelector('.main').innerHTML = `
        <form onsubmit="Player.getPlayer(event)">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" placeholder="Enter your name">
            <br>
            <label for="class">Class:</label>
            <select id="class" name="class">
                <option value="warrior">Warrior</option>
                <option value="mage">Mage</option>
                <option value="rogue">Rogue</option>
            </select>
            <br>
            <button type="submit">Start Game</button>
        </form>`
    }
    continue() {
        // Chose randomly a new quest
        const questKeys = Object.keys(quests);
        const randomQuestKey = questKeys[Math.floor(Math.random() * questKeys.length)];
        const randomQuest = quests[randomQuestKey];

        // Create a new Quest instance with the randomly selected quest
        currentQuest = new Quest(randomQuest.name, randomQuest.description, randomQuest.enemy, randomQuest.reward);
        currentQuest.start();
    }
    end() {
        // End game
        document.querySelector('.main').innerHTML = `
        <h1>Game Over</h1>
        <button onclick="game.start()">Restart</button>`
    }
}

const items = {
    // healthPotion: {
    //     name: 'Health Potion',
    //     price: 5
    // }
}

const weapons = {
    sword: {
        name: 'Sword',
        damage: 5,
        modifier: "strength",
        price: 10
    },
    axe: {
        name: 'Axe',
        damage: 7,
        modifier: "strength",
        price: 15
    },
    bow: {
        name: 'Bow',
        damage: 3,
        modifier: "dexterity",
        price: 10
    },
    staff: {
        name: 'Staff',
        damage: 4,
        modifier: "intelligence",
        price: 10
    },
    dagger: {
        name: 'Dagger',
        damage: 3,
        modifier: "dexterity",
        price: 5
    },
    wand: {
        name: 'Wand',
        damage: 2,
        modifier: "intelligence",
        price: 5
    }
}

const armors = {
    leather: {
        name: 'Leather',
        defense: 2,
        price: 10
    },
    chainmail: {
        name: 'Chainmail',
        defense: 4,
        price: 15
    },
    plate: {
        name: 'Plate',
        defense: 6,
        price: 20
    }
}

const classes = {
    warrior: {
        name: 'Warrior',
        constitution: 10,
        strength: 10,
        dexterity: 5,
        intelligence: 1,
        starterWeapon: weapons.sword,
        starterArmor: armors.leather
    },
    mage: {
        name: 'Mage',
        constitution: 5,
        strength: 1,
        dexterity: 5,
        intelligence: 10,
        starterWeapon: weapons.staff,
        starterArmor: armors.leather
    },
    rogue: {
        name: 'Rogue',
        constitution: 5,
        strength: 5,
        dexterity: 10,
        intelligence: 1,
        starterWeapon: weapons.dagger,
        starterArmor: armors.leather
    }
}

const enemies = {
    goblin: {
        name: 'Goblin',
        weapon: weapons.axe,
        armor: armors.leather,
        maxHealth: 10,
        type: 'goblin'
    },
    orc: {
        name: 'Orc',
        weapon: weapons.axe,
        armor: armors.chainmail,
        maxHealth: 15,
        type: 'orc'
    },
    ogre: {
        name: 'Ogre',
        weapon: weapons.axe,
        armor: armors.plate,
        maxHealth: 20,
        type: 'ogre'
    },
    troll: {
        name: 'Troll',
        weapon: weapons.axe,
        armor: armors.plate,
        maxHealth: 25,
        type: 'troll'
    },
    dragon: {
        name: 'Dragon',
        weapon: weapons.axe,
        armor: armors.plate,
        maxHealth: 50,
        type: 'dragon'
    }
}

const quests = {
    goblinSlayer: {
        name: 'Goblin Slayer',
        description: 'You encountered a goblin!',
        enemy: new Enemy(enemies.goblin.name, enemies.goblin.weapon, enemies.goblin.armor, enemies.goblin.maxHealth, enemies.goblin.type),
        reward: new HealthPotion()
    },
    orcSlayer: {
        name: 'Orc Slayer',
        description: 'You encountered a orc',
        enemy: new Enemy(enemies.orc.name, enemies.orc.weapon, enemies.orc.armor, enemies.orc.maxHealth, enemies.orc.type),
        reward: new HealthPotion()
    },
    ogreSlayer: {
        name: 'Ogre Slayer',
        description: 'You encountered a ogre',
        enemy: new Enemy(enemies.ogre.name, enemies.ogre.weapon, enemies.ogre.armor, enemies.ogre.maxHealth, enemies.ogre.type),
        reward: new HealthPotion()
    },
    trollSlayer: {
        name: 'Troll Slayer',
        description: 'You encountered a troll',
        enemy: new Enemy(enemies.troll.name, enemies.troll.weapon, enemies.troll.armor, enemies.troll.maxHealth, enemies.troll.type),
        reward: new HealthPotion()
    },
    dragonSlayer: {
        name: 'Dragon Slayer',
        description: 'You encountered a dragon',
        enemy: new Enemy(enemies.dragon.name, enemies.dragon.weapon, enemies.dragon.armor, enemies.dragon.maxHealth, enemies.dragon.type),
        reward: new HealthPotion()
    }
}

let player;
let currentQuest;

let game = new GameProgress();
game.start();