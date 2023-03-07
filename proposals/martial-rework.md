# Martial Skills System Rework 2023 #

# **TL;DR** _(Summary)_ #
Conveying the changes here will take many words. I will try to give a high-level summary of the changes:

## Stamina Points
- Instead of buying individual martial skills, characters will now purchase "Stamina Points", which is a pool that functions similarly to Mana Points do for spells.
- Martial Skills have been reworked into a leveled system, similar to spells
- Characters may expend Stamina Points to perform Martial abilities (Slay, resist, etc.). Resting refills a character's Stamina Pool.
- Weapon Proficiencies are Level 10 Stamina abilities, granting +1 damage until Rest.

## Stamina Pool Costs
| Stamina Pool        | F   | T   | R   | S     |
|---------------------|-----|-----|-----|-------|
| Cost per 10 Stamina | 5+3 | 5+5 | 5+8 | 20+10 |


## Stamina Abilities
- The Stamina cost of each ability is equal to its level (ie, Disarm costs 1 Stamina Point, Curse costs 6 Stamina Points)

| Level | Ability Name     | Description                                                                                                                                              | Verbal                                                               |  
|-------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------|
| 1	    | Critical Strike  | 	Allows user to add +1 damage against a single target. May be stacked up to +5. <br>Ends at Rest or when invoking crit strike against a different target | _"This is my boomstick!"_                                            |
| 1     | Disarm	           |                                                                                                                                                            | Physical Disarm                                                      |
| 1     | Blind	           |                                                                                                                                                            | _"Pocket sand! Physical Blind"_                                      |
| 1     | Slow	           |                                                                                                                                                            | Physical Slow                                                        |  
| 2     | Stop Thrust	       |                                                                                                                                                            | _"You shall not pass!"_                                              |
| 3     | Rapid Refit	       |                                                                                                                                                            | _"Rapid refit 1, rapid refit 2, rapid refit 3... refit complete"_ |
| 4     | Disable Limb	   |                                                                                                                                                            | Physical Disable Limb                                                |
| 4     | Stun	           |                                                                                                                                                            | _"Mama said knock you out... Physical Stun"_                         |
| 4     | Kneel	           |                                                                                                                                                            | Physical Kneel                                                       |
| 4     | Parry        	   |                                                                                                                                                            | _"Float like a butterfly"_                                           | 
| 4     | Spell Parry 	   |                                                                                                                                                            | _"Can't touch this"_                                                 |
| 5     | Silence	           |                                                                                                                                                            | Physical Silence                                                     |
| 5     | Vital Blow         | 	Allows swinging base weapon damage + profs (NO modifications) as vital                                                                                  | _"Get wrecked! X Normal Vital"_                                      |
| 6     | Fear	           |  Intimidate                                                                                                                                                | _"Nice face. Should would be a shame if something bad happened to it... Physical Fear_                                                        |
| 6     | Sleep	           |                                                                                                                                                            | Physical Sleep                                                       |
| 6     | Intercept	       |                                                                                                                                                            | Intercept                                                            |
| 7     | Curse	           |                                                                                                                                                            | Physical Curse                                                       |
| 7     | Destroy	           |                                                                                                                                                            | Physical Destroy \<weapon, shield, armor\>                           |
| 8     | Endurance          |                                                                                                                                                            | 	"Endurance"                                                        |
| 9     | Regenerate	       | Concentrate for 1 minute, restore all HP, cannot do anything else (ie refit)                                                                               | _"Ohhhmmmmmmm... Begin Regenerate... Regenerate Complete"            |
| 10    | Slay               | 	Does damage equal to the amount of Stamina spent * 10 (min 100)  [100 Normal]                                                                           | _"Good, bad, I'm the guy with the gun... 100 Normal Slay"_           |
| 10    | Proficiency        |                                                                                                                                                            | _"I'm here to kick ass and chew bubble gum, and I'm all outta gum"_ |


## Weapon Types and Proficiency Changes
- Weapon types have been consolidated into 3 categories: One-handed Weapons, Two-handed Weapons, and Ranged Weapons.
- Stamina Skills no longer require specific weapon types, all Stamina skill may be used with any melee weapon
- Removed Two-handed Block as a purchasable skill; characters that possess the Two-handed Weapon skill may block one-handedly
- Removed "Shield and Short Weapon" as a purchasable skill; Characters that posses the Ranged Weapon skill, the One-handed Weapon skill, _and_ the Ranged skill may wield a short weapon in one hand and block with a bow in the other
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
- Weapon Proficiencies work slightly different for Fighters and Rogues:
    - Fighters: May use any melee proficiency for any melee weapon, for either hand.
        - ex: Atilla the Fighter spends 20 Stamina Points for two "One-handed Proficiencies". Atilla may use their +2 damage with any longsword, claw, two-handed sword, polearm, etc. (Everything but a bow or thrown)
    - Rogues: May use any Ranged proficiecies for bows, crossbows, or thrown weapons. Additionally, Rogues may use Ranged proficiencies with any one-handed melee weapon, but only from behind their target (ie, Rogue Ranged profs are also +1 melee backstabs)
- Two-handed Weapons receive 1.5x (rounded down) benefit from Proficiencies
    - ex: Branuk spends 20 Stamina Points for 2x Two-handed Weapon Proficiencies. He can now swing his Two-handed Sword for +3 damage

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
