# Magic System Rework 2023 #

# **TL;DR** _(Summary)_ #
Conveying the changes here will take many words. I will try to give a high-level summary of the changes:

- Arcane, Nature, and Spirit Mana Pools are being condensed into a single mana pool.
- Skill Point costs for Attunement (Mana Pool) are slightly increased across the board
- Barrier: Spell Aegis, Barkskin, and Toxin Shield merged into a single spell
- Reflect: Reflect Spell, Stoneskin, Reflect Toxin merged into a single spell
- Able to have only 1 Barrier and 1 Reflect at a time
- Introduction of Universal Spells as cross-school spells
- Introduction of a 10th level of spells
    - Arcane: Arcane Torrent, Doom 
    - Nature: Spider Web
    - Spirit: Death
- Death and Doom are damage-dealing spells
- Entrapment is now Entrap Spirit

# The Goal #
Our goal is to grant casters more compelling customization choices while simultaneously reigning in some of the offensive and defensive power of casters.

This rework may make it seem like things are fundamentally changing in big ways for casters. Many of the changes (such as merging mana pools) is really a formalization of what our players were already doing, ie, dual or tri-school casting anyway.

"Instant Death" take-down spells present a big statting problem for the plot team. Every NPC that goes out has to stack many Resist Magic to challenge the PCs, but doing so ultimately makes high level characters feel ineffective _(I threw 10 Dooms and it resisted all of them!?)_, and low level characters feel useless _(I have too little mana to be useful if everything takes 10 spells to affect)_.

# Single Mana Pool #
Mana pools are being condensed into a single pool of MP. Instead of having 3 different Attunement skills that each grant mana for a school, there is now a single Attunement skill.

At each rest, the player may allocate their mana as they choose for each school.

> EX: Archibald the Archwizard purchases the Attunement skill 10 times, granting him a total of 100 Mana Points. As he comes into game at the start of the event, he decides to allocate 50 Mana to Arcane, 30 Mana to Spirit, and 20 Mana to Nature. At his next rest, he decides to allocate all 100 Mana Points to Arcane.

Characters may still choose to memorize their spells, and doing so will grant the +10% MP. If a character memorizes in this way, all MP across all schools must be memorized (ie, not allowed to memorize their Arcane spells while Cast on the Fly their Nature spells).

# New Magic Skills #
**School Initiation** - Replaces the former "mastery" skills. Each purchase allows the character access another school of magic. Characters may only allocate their MP into schools for which they have the associated Initiation skill.

**School Specialization** - New skill. May only be purchased once. Grants the character the ability to cast Level X spells of their chosen school.

| Magic Skill Costs | F     | T   | R    | S   |
|-------------------|-------|-----|------|-----|
| School Initiation | 5+5   | 3+4 | 5+5  | 3+1 |
| School Mastery    | 20    | 15  | 20   | 10  |
| Attunement        | 10+10 | 3+4 | 10+8 | 3+1 |

# Spell Changes #
- Introduction of spell level 10
- Death and Doom are Level 10 spells
- Death and Doom deal damage (instead of outright killing the target)
- \*A character may have only one Barrier spells (Resist Physical, Resist Toxin, Resist Magic) and one Reflect spell upon them at a time. *(This is under review, see "Resist Stacking Changes")*

## Universal Spells ##

The following spells may be cast using any of Arcane, Nature, or Spirit mana:
I   - Glowing Light  
IV  - Barrier
V   - Entrap Spirit, change incant to “...entrap your spirit”  
VII - Reflect  
IX  - Dispel Magic  



| **Spell** | **Barrier** |
|-----------|-------------|
| School                 | Universal |
| Level                  | 4 |
| Duration               | Rest |
| Incant                 | "I conjure a \<type\> barrier." |
| **Description**        | This spell grants the target a single use of ONE of Resist Toxin, Resist Physical, or Resist Spell. This is an ACTIVE RESIST effect. A character may not have more than 1 Active Resist at a time. |

| **Spell**    | **Reflect**                                                                                                                                                                                          |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| School                 | Universal                                                                                                                                                                                            |
| Level                  | 4                                                                                                                                                                                                    |
| **Duration** | Rest                                                                                                                                                                                                 |
| **Incant**   | "I conjure a reflect \<type\>."                                                                                                                                                              |
| **Description** | This spell grants the target a single use of ONE of Resist Toxin, Resist Physical, or Resist Spell. This is an ACTIVE REFLECT effect. A character may not have more than 1 Active Reflect at a time. |

## Arcane ##
| **Spell**    | **Arcane Torrent**                                                                                                                                                                                                                                              |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **School**   | Arcane                                                                                                                                                                                                                                                          |
| **Level**    | 10                                                                                                                                                                                                                                                              |
| **Duration** | Concentration                                                                                                                                                                                                                                                   |
| **Incant**   | "I rain destruction about you all! ... Magic mana bolt 5, Magic mana bolt 5, ..."                                                                                                                                                                               |
| **Description** | The caster plants their feet and is able to throw "Magic Mana Bolt 5" until their concentration is broken (body damage or any status effect that would prevent spellcasting), they move their feet, or they activate a game skill other than calling a defense. |

| **Spell**    | **Doom**                      |
|--------------|-------------------------------|
| **School**   | Arcane                        |
| **Level**    | 10                            |
| **Duration** | Instant                       |
| **Incant**   | "I set your doom upon you, X" |
| Description  | The caster hurls a bolt of Arcane energy at their target that deals 50 damage. This damage can be increased by +5 points for each additional mana point expended at time of cast, up to the character's current available mana. |

## Nature ##
| **Spell**    | **Spider Web**                                                                                    |
|--------------|---------------------------------------------------------------------------------------------------|
| **School**   | Nature                                                                                            |
| **Level**    | 10                                                                                                |
| **Duration** | Concentration                                                                                     |
| **Incant**   | "By Nature, I set the webs upon you all! ... Physical Entangle Body, Physical Entangle Body, ..." |
| **Description** | The caster plants their feet and is able to throw "Physical Entangle Body" until their concentration is broken (body damage or any status effect that would prevent spellcasting), they move their feet, or they activate a game skill other than calling a defense. |

## Spirit ##
| **Spell**    | **Death**                                                |
|--------------|----------------------------------------------------------|
| **School**   | Spirit                                                   |
| **Level**    | 10                                                       |
| **Duration** | Instant                                                  |
| **Incant**   | "I grant you the gift of death X... Magic Heal Wounds X" |
| **Description** | The caster saps the vital force of the target for 25 damage, then within 3 seconds, the caster may touchcast a Magic Heal Wounds 25 _or_ Magic Necrotic Touch 25. The damage and healing can be increased by +5 points for each additional mana point expended at time of cast, up to the character's current available mana. Regardless of the result of the damage portion of the spell, the caster may still cast the healing portion (ie, if the damage is resisted or missed, the caster may still cast the Magic Heal Wounds). |



