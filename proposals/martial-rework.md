# Martial Skills System Rework 2023 #

# **TL;DR** _(Summary)_ #
Conveying the changes here will take many words. I will try to give a high-level summary of the changes:
- Stamina Points replace individual Martial Skill purchases
  - Proficiencies are a Stamina Point skill
      - Fighters and Rogues receive an additional benefit from proficiencies
      - Two-handed Weapons get 1.5x benefit from proficiencies
- Weapon types have been consolidated into One-handed Weapon, Two-handed Weapon, and Ranged Weapon.
- Characters must prepare all Resist, Reflect, and Dodge abilities before they can be used
    - All defense effects (Resist, Reflect, Barrier, Dodge, etc) consume "Active Defense" slots
    - Characters have 1 Defense Slot. More can be purchased with Skill Points.
- Added Dexterity Armor
- Removed Fencing and Stalwart Defense


## Stamina Points
- Instead of buying individual martial skills, characters will now purchase "Stamina Points", which is a pool that functions similarly to Mana Points do for spells.
- Martial Skills have been reworked into a leveled system, similar to spells
- Characters may expend Stamina Points to perform Martial abilities (Slay, resist, etc.). Resting refills a character's Stamina Pool.

## Stamina Pool Costs
| Stamina Pool        | F   | T   | R   | S     |
|---------------------|-----|-----|-----|-------|
| Cost per 10 Stamina | 5+3 | 5+5 | 5+8 | 20+10 |


## Stamina Abilities
- The Stamina cost of each ability is equal to its level (ie, Disarm costs 1 Stamina Point, Curse costs 6 Stamina Points)

| Level | Ability Name     | Description                                                                                                                                              | Verbal                                                               |  
|-------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| 1	    | Critical Strike  | 	Allows user to add +1 damage against a single target. May be stacked up to +5. <br>Ends at Rest or when invoking crit strike against a different target | \* _This is my boomstick!_                                            |
| 1     | Disarm	           |                                                                                                                                                            | Physical Disarm                                                      |
| 1     | Blind	           |                                                                                                                                                            | Physical Blind |
| 1     | Slow	           |                                                                                                                                                            | Physical Slow                                                        |  
| 2     | Stop Thrust	       |                                                                                                                                                            | _Stop Thrust_ |
| 3     | Rapid Refit	       |                                                                                                                                                            | _Rapid refit 1, rapid refit 2, rapid refit 3... refit complete_ |
| 4     | Disable Limb	   |                                                                                                                                                            | Physical Disable Limb                                                |
| 4     | Stun	           |                                                                                                                                                            | Physical Stun |
| 4     | Kneel	           |                                                                                                                                                            | Physical Kneel                                                       |
| 4     | Parry        	   |                                                                                                                                                            | I focus my defenses against weapons | 
| 4     | Spell Parry 	   |                                                                                                                                                            | I focus my defenses against magic |
| 5     | Silence	           |                                                                                                                                                            | Physical Silence                                                     |
| 5     | Vital Blow         | 	Allows swinging base weapon damage + profs (NO modifications) as vital                                                                                  | \*_Get wrecked! X Normal Vital_                                      |
| 6     | Fear	           |  Intimidate                                                                                                                                                | Physical Fear                                                        |
| 6     | Sleep	           |                                                                                                                                                            | Physical Sleep                                                       |
| 6     | Intercept	       |                                                                                                                                                            | Intercept                                                            |
| 7     | Curse	           |                                                                                                                                                            | Physical Curse                                                       |
| 7     | Destroy	           |                                                                                                                                                            | Physical Destroy \<weapon, shield, armor\>                           |
| 8     | Endurance          |                                                                                                                                                            | 	Endurance                                                        |
| 9     | Regenerate	       | Concentrate for 1 minute, restore all HP, cannot do anything else (ie refit)                                                                               | \* _Ohhhmmmmm... Begin Regenerate... Regenerate Complete_           |
| 10    | Slay               | 	Does damage equal to the amount of Stamina spent * 10 (min 100)  [100 Normal]                                                                           | \* _Good, bad, I'm the guy with the gun... 100 Normal Slay_           |
| 10    | Proficiency        |                                                                                                                                                            | \* _I'm here to kick ass and chew bubble gum, and I'm all outta gum_ |

***\* Not the actual verbal. Still need real incants for these abilities... suggestions are welcome!***


## Weapon Types and Proficiency Changes
- Weapon types have been consolidated into 3 categories: One-handed Weapons, Two-handed Weapons, and Ranged Weapons.
- Stamina Skills no longer require specific weapon types, all Stamina skill may be used with any melee weapon
- Removed Two-handed Block as a purchasable skill; characters that possess the Two-handed Weapon skill may block one-handedly
- Removed "Bow and Short Weapon" as a purchasable skill; Characters that posses the Ranged Weapon skill, the One-handed Weapon skill, _and_ the Dual Wield skill may wield a short weapon in one hand and block with a bow in the other
- Removed "Dual Wield Long Weapon" skill: Characters that have the Dual Wield skill may wield any one-handed melee weapon in one hand, and up to short sword length weapon in the other
- Added Parrying Dagger skill, which allows a character to wield as 12"-18" long dagger as a **defensive-only** weapon (ie, it **cannot** be used to delivery **any** attack, spellstrike, or other offensive/combat ability) 
- What was previously "Unarmed Combat" has been rolled into One-handed Weapon, which allows a character to use a single short sword-length claw. Using two claws requires the Dual Wield skill.

| Weapon Skills     | F   | T   | R   | S   | Pre-requisites    |
|-------------------|-----|-----|-----|-----|-------------------|
| One-handed Weapon | 3   | 3   | 5   | 8   |                   |
| Two-handed Weapon | 3   | 3   | 5   | 8   |                   |
| Ranged Weapon     | 3   | 5   | 3   | 8   |                   |
| Shield            | 3   | 3   | 5   | 8   |                   | 
| Dual Wield        | 3   | 5   | 3   | 8   | One-handed Weapon |
| Parrying Dagger   | 2   | 2   | 2   | 2   |                   |


## Proficiencies
- Proficiencies last until the character next rests
- Weapon Proficiencies work slightly different for Fighters and Rogues:
    - Fighters: May use any melee proficiency for any melee weapon, for either hand.
        - ex: Atilla the Fighter spends 20 Stamina Points for two "One-handed Proficiencies". Atilla may use their +2 damage with any longsword, claw, two-handed sword, polearm, etc. (Everything but a bow or thrown)
    - Rogues: May use any Ranged proficiecies for bows, crossbows, or thrown weapons. Additionally, Rogues may use Ranged proficiencies with any one-handed melee weapon, but only from behind their target (ie, Rogue Ranged profs are also +1 melee backstabs)
- Two-handed Weapons receive 1.5x (rounded down) benefit from Proficiencies
    - ex: Branuk spends 20 Stamina Points for 2x Two-handed Weapon Proficiencies. He can now swing his Two-handed Sword for +3 damage
- Proficiencies are declared for a Weapon Type and hand (ie, One-handed Weapon, Right Hand). Two-handed Weapons and Ranged Weapons benefit from proficiencies invoked for both hands. 

| Two-handed Weapon Profs | Damage Increase |
|-------------------------|-----------------|
| 1                       | +1 Damage       |
| 2                       | +3 Damage       |
| 3                       | +3 Damage       |
| 4                       | +6 Damage       |
| 5                       | +6 Damage       |
| 6                       | +9 Damage       |
| 7                       | +9 Damage       |
| 8                       | +12 Damage      |
| 9                       | +12 Damage      |
| 10                      | +15 Damage      |

## Martial Defensive Consolidation
- All Martial skills that granted a Physical Resist have been merged into a single skill called "Parry"
- All Martial skills that granted a Spell Resist have been merged into a single skill called "Spell Parry"
- Neither Parry nor Spell Parry require the character to be holding a weapon

## Active Defenses
- Parry and Spell Parry must be prepared in advance to their use
    - Similar to casting a Barrier spell, this means the character must incant the ability verbal before they can use the Resist
    - "I focus my defenses against \<Weapons|Magic\>"
- Once prepared, the defensive is an "Active Defense", and can be used to defend against its appropriate type of attack
- NOTE: This ruling eliminates the restriction on the Barrier and Reflect spells; characters may have be affected by one Barrier/Reflect _for each type_ (ie, Spell Barrier, Physical Barrier, Toxin Barrier), up to their maximum Defense Slots


## Defense Slots
- A character may only have as many Active Defenses as they have Defense Slots
- _Any_ skill, ability, or effect that grants a Resist, Reflect, or Dodge requires a Defense Slot to be prepared (This includes Monstrous Resist, the Barrier spell, the Reflect Spell, etc.) 
- All character automatically have 1 Defense Slot for free
- Additional Defense Slots may be purchased with Skill Points

| Defense Slots Cost      | F     | T     | R     | S     |
|-------------------------|-------|-------|-------|-------|
| Additional Defense Slot | 10+30 | 10+30 | 10+30 | 10+30 |


| Total Defense Slots | Cumulative SP Cost |
|---------------------|--------------------|
| 1                   | 0                  |
| 2                   | 10                 |
| 3                   | 50                 |
| 4                   | 120                |
| 5                   | 350                |
| 6                   | 510                |

## Armor Changes
- Added Dexterity Armor skill
- Removed Fencing and Stalwart Defense skills

### Dexterity Armor
- Dexterity Armor does not require an armor rep
- Different armor types DO NOT stack (ie, you can have either Dexterity Armor or physical armor, not both)
- Dexterity Armor takes 1 minute of stretching (concentration) to "refit"
    - Player must RP stretching, yoga, etc. 

| Dexterity Armor    | F     | T     | R     | S     |
|--------------------|-------|-------|-------|-------|
| +5 Dexterity Armor | 10+10 | 10+10 | 10+10 | 10+10 |
