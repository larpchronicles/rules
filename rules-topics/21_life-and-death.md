# Life & Death

## Body _(aka Health Points)_

---
Body is the measurement of a character's state of health, and is often referred to as "Health Points" or "Hit Points" in many RPG systems. All characters start with 10 Body, and gain more via the Toughness skill. Receiving any amount of Damage reduces the character's Current Body. They can receive healing effects to increase their Body after taking Damage, but healing may never put them above their Maximum Body.


## Alive

---
Any character with 1 or more Current Body is "**Alive**."


## Unconscious

---
A character whose Current Body is exactly 0 is considered **Unconscious**. A character who is Unconscious is unable to take any actions that require active thought or movement, and the character is considered helpless. Being **Unconscious** lasts for 1 minute, at the end of which time the character is returned to consciousness with 1 Body. If a character takes any additional damage while at 0 and **Unconscious**, they proceed to begin **Bleeding Out**.


## Bleeding Out (aka Dying)

---
A character who has their Current Body reduced to -1 is considered **Bleeding Out**. A character cannot be reduced to below -1 Body, regardless of the amount of damage taken.

**Bleeding Out** lasts for 1 minute, during which the character is unconscious and may not make any game actions that require consciousness. Any amount of healing will restore the character's Body by the amount stated by the healing effect, and they will no longer be **Bleeding Out**.

Receiving First Aid will pause the dying count until the First Aid is completed or the character performing the First Aid is interrupted, at which point the **Dying** character will either be at 0 body, **Unconscious**, or their **Bleeding Out** count will resume at its previous count.

After 1 minute of **Bleeding Out**, the character dies and is now **Dead**.

_(Ex: Bob is **Bleeding Out**. Thirty seconds into **Bleeding Out**, Charlie heals Bob for 10 body. Bob is now conscious, able to act again, and has 9 body.)_


## Dead

---
A character that goes 1 minute of **Bleeding Out** without receiving any healing or First Aid, or who is affected by some other Death effect, becomes **Dead**.

**Death lasts for 5 minutes**, at which point, the character's body dissipates, their spirit departs and travels to a **Shrine of Resurrection.** Any in-game items the character possesses when they dissipate are dropped to the ground, the player puts on a white headband and goes Out-Of-Game, and should seek out a marshal (either the marshal of the mod, or NPC camp) to seek resurrection.

While **Dead**, a character is not aware of their surroundings, and may not make any game actions, move, speak, be affected by any effect that reduces or heals Body Points, or be affected by any effect that does not specifically target **Dead** bodies.

During the 5 minutes the character is **Dead**, if they receive a Life spell or Revivify spell, they become **Alive** as per the spell they receive _(ie, Life will restore the character's Current Body to their Maximum Body, Revivify will restore the character to **Alive** but **Unconscious** at 0 body)_.

Any effects that were present on the character when they became DEAD remain in effect, unless an effect specifies otherwise.


## Spirits

---
The spirit of a character is the essence of that person. Spirits are always Out Of Game, and may not interact with or be aware of the In-Game world, and In Game characters may only interact with spirits within a Shrine of Resurrection or while under an effect that explicitly states that they may do so.


## Resurrection

---
A character who has passed their 5 minute **Death** count dissipates, and their spirit will depart to seek **Resurrection**. If the spirit, as an Out-of-Game decision, believes that an ally may come and attempt to **Resurrect** them using the Rank IX Spirit Spell Resurrection, then they may linger for a time. If they do not, then the spirit will depart it's current location to seek the nearest safe **Shrine of Resurrection.** The knowledge of whether or not a specific Shrine is "Safe" is entirely OOG knowledge, but a Spirit will never **Resurrect** at an unsafe Shrine. When a Spirit **Resurrects**, they will accrue **Strain**, explained below.

When a player resurrects all Non-Ritual effects are removed unless otherwise told by Plot.

Any player may choose to have their character dissipate at any time, for any reason, and then immediately seek resurrection unless they are hit with a decimate effect.  This can be used to refuse effects including those delivered by a killing blow (except decimate).  This is an OOG decision and the player does not need to explain their decisions. 

## SP Debt
When a character resurrects, they incur **SP Debt**, which results in a portion of the character's SP becoming temporarily unavailable to be used. 

**Total Debt**: SP that is held "in debt", unable to be use by the character.  
**Total SP**: The total amount of SP the character has. This number is **not** affected by SP Debt in any way, and continues to increase normally as the player attends events.  
**Effective SP**: The amount of SP available to the character to spend on skills. Equal to `Total SP - Total Debt`   

The character does not permanently lose SP, and having an SP Debt does not affect how the character gains Total SP. SP Debt is not calculated until **after** an event; **a player will not need to rewrite their character or drop skills in the middle of an event because of SP Debt.**

After every event a player attends, any SP Debt they have is reduced by 25% (minimum 3) of their Total Debt. Then, if that character died during the event, their debt is increased by 5% (rounded down) of their Effective SP for every death they incurred.  After this, if the character's Total Debt is greater than 25% of their Total SP, the character permanently dies.

### Post-Event SP Calculation
```
1) Pay off old debt: New Total Debt = 75% of Total Debt [rounded down] (aka, reduce Total Debt by 25%)		
2) Calculate New Debt Incurred: Add 5% of Effective SP to Total Debt for each Death during the event			
3) Gain SP for the event: Add SP gained to Total SP			
4) Calculate New Effective SP (Total SP - Total Debt)
```

#### SP Debt Example
> Octoro the Orc begins a 2-day weekend event with 300 SP. They resurrect once during the event. After the event, they will incur a debt of 15 SP (300 * .05). They will gain 6 SP for the event. Octoro now has:
> Total SP: 306
> Total Debt: 15
> Effective SP: 291
> So, at the beginning of the next event Octoro the Orc attends, they will only be able to utilize up to 291 SP to purchase skills.
> 
> At the next event Octoro the Orc attends, they do not resurrect. After the event, their debt will be reduced by 4. (15 Total Debt .25, rounded up). Octoro the Orc now has:
> Total SP: 312
> Total Debt: 11
> Effective SP: 301
> 
> At their third event, Octoro the Orc ressurects again. After the event, their debt is first reduced by 3. Then, they incur 15 addition debt `(312 Total SP - 8 Debt) * .05 = 15`, bringing their Total Debt to 23. Octoro now has:
> Total SP: 318
> Total Debt: 23
> Effective SP: 295

See [larpchronicles.com/spdebtcalculator](https://docs.google.com/spreadsheets/d/15gMsb7XrGNeszVXrXdbBHoo2zRIrJsqgvPt6i-ehjxA/edit#gid=711556602) for an interactive SP Debt calculator. 


## Permanent Death

---
A character who is **Permanently Dead** may no longer be returned to life by any means. The Player of a **Permanently Dead** character may then roll 50% of the accumulated SP of the **Permanently Dead** character into a new Character, plus the base 100 SP for a new character.


## Killing Blow

---
Killing Blow is a 3-count that can be interrupted. When Killing Blowed, the target becomes **Dead**. _Killing Blow 1, Killing Blow 2, Killing Blow 3 &lt;type>_.  The target of a killing blow may refuse it, so long as they are capable of movement.  Any killing blow is assumed to automatically be refused by a target capable of movement, unless explicitly accepted by the target.


## Dismemberment & Body Smuggling

---
A character whose body has been dismembered while **Bleeding Out** or **Dead** may still be healed or revived. The part of the character that can be so affected is represented by and located wherever the player of that character is. The spirit-containing body of a character may be carried by another character, however, the person carrying the body may not run or move faster than the player of the character being carried.

Dismembering a character for the purpose of attempting to use a smaller body part to heal, revive, or even hide the character is not any different than if the character were not dismembered. If a character is **Bleeding Out** or **Dead** and someone wishes to bring that character to a healer, or move the body away from where it fell, they may role-play carrying the body by picking it up on a three count _(ex: "One I pick you up… Two I pick you up… Three I pick you up…")_ and carrying it elsewhere. The carrying player may not run, and both players must roleplay maintaining contact and remain within arm's reach of each other. If any effect would forcibly move the carrier away at a pace faster than a walk, or would otherwise render them unable to hold game items in their hands, the character must drop the body on a One Count _(ex: "One I drop you")_ and may only resume carrying them on a new three count.

## Metabolisms
Most people and creatures have a regular metabolism. Characters with "no metabolism" or "undead metabolism" are affected by some game effects differently:

### No Metabolism
- **Crumble at 0 Body** _(When the character reaches 0 or fewer Body Points, they immediately dissipate and seek resurrection.)_
- Immune to Toxin
- Immune to Berserk, Command: Confuse, Death, Boon of Nature, Drain, First Aid, Heal Wounds, Hearthstone, Infect, Life, Regenerate, Revive, Revivify, Sleep, Stun, Vampiric Touch, Waylay

> _Generally, a creature that has no metabolism cannot be healed by typical means, but will have an alternate method of being healed. For instance, a Fire Elemental would be immune to standard healing effects, but could be healed by Flame._ 

### Undead Metabolism
Creatures with Undead Metabolism follow the same rules as "No Metabolism," with the excpetions that they are affected by Heal Wounds (and other standard healing effects) normally, as well as being affected by effects and abilities that specifically target undead (such as Harm Undead).

## Spirit Bottle
A character with a Spirit Bottle has stored their spirit for safe keeping in an item. Doing so protects the character from incurring Strain, however, it causes the character's body to become brittle. All characters with a Spirit Bottle must crumble at 0 body, and unless otherwise specified, have No Metabolism.

Instead of resurrecting normally, a character with a Spirit Bottle may choose to reform at their Spirit Bottle. Doing so follows the rules for normal resurrection, with these exceptions:
- Instead of incurring Strain, the number of charges on the character's Spirit Bottle is reduced by 1.
- The character may only reform wherever their Spirit Bottle is located

When initially created, a Spirit Bottle has 10 charges. If, at any time, the Spirit Bottle is reduced to 0 charges, it can no longer be used to reform. A character with a Spirit Bottle that has 0 charges still crumbles at 0 body, but must resurrect (and incur Strain) normally.

Spirit Bottles may have their charges replenished. Doing so requires the casting of the Spirit Bottle ritual. A Spirit Bottle cannot have more than 10 charges.