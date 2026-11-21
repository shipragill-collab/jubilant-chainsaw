/** French, Latin and KS3 English vocabulary for scholarship and GCSE practice. */

/** [French, English] */
export const FRENCH_VOCAB: [string, string][] = [
  ["la maison", "the house"], ["le chien", "the dog"], ["le chat", "the cat"], ["la voiture", "the car"], ["le livre", "the book"],
  ["l'école", "the school"], ["la plage", "the beach"], ["la ville", "the town"], ["le pain", "the bread"], ["la pomme", "the apple"],
  ["le fromage", "the cheese"], ["la mer", "the sea"], ["le ciel", "the sky"], ["la fenêtre", "the window"], ["la porte", "the door"],
  ["le jardin", "the garden"], ["la cuisine", "the kitchen"], ["le frère", "the brother"], ["la sœur", "the sister"], ["les parents", "the parents"],
  ["l'ami", "the friend (male)"], ["le travail", "the work"], ["les devoirs", "the homework"], ["la gare", "the station"], ["le magasin", "the shop"],
  ["rapide", "fast"], ["lent", "slow"], ["grand", "big / tall"], ["petit", "small"], ["heureux", "happy"],
  ["triste", "sad"], ["fatigué", "tired"], ["facile", "easy"], ["difficile", "difficult"], ["cher", "expensive"],
  ["toujours", "always"], ["souvent", "often"], ["jamais", "never"], ["parfois", "sometimes"], ["hier", "yesterday"],
  ["demain", "tomorrow"], ["aujourd'hui", "today"], ["maintenant", "now"], ["beaucoup", "a lot"], ["peu", "a little"],
  ["manger", "to eat"], ["boire", "to drink"], ["parler", "to speak"], ["écouter", "to listen"], ["regarder", "to watch"],
  ["jouer", "to play"], ["aller", "to go"], ["venir", "to come"], ["prendre", "to take"], ["finir", "to finish"],
  ["choisir", "to choose"], ["vendre", "to sell"], ["attendre", "to wait"], ["voir", "to see"], ["savoir", "to know (a fact)"],
];

/** Present tense: [infinitive, meaning, je, tu, il/elle, nous, vous, ils/elles] */
export const FRENCH_VERBS: [string, string, ...string[]][] = [
  ["être", "to be", "suis", "es", "est", "sommes", "êtes", "sont"],
  ["avoir", "to have", "ai", "as", "a", "avons", "avez", "ont"],
  ["aller", "to go", "vais", "vas", "va", "allons", "allez", "vont"],
  ["faire", "to do / make", "fais", "fais", "fait", "faisons", "faites", "font"],
  ["parler", "to speak", "parle", "parles", "parle", "parlons", "parlez", "parlent"],
  ["finir", "to finish", "finis", "finis", "finit", "finissons", "finissez", "finissent"],
  ["vendre", "to sell", "vends", "vends", "vend", "vendons", "vendez", "vendent"],
  ["pouvoir", "to be able to", "peux", "peux", "peut", "pouvons", "pouvez", "peuvent"],
  ["vouloir", "to want", "veux", "veux", "veut", "voulons", "voulez", "veulent"],
  ["prendre", "to take", "prends", "prends", "prend", "prenons", "prenez", "prennent"],
];
export const FRENCH_PRONOUNS = ["je", "tu", "il", "nous", "vous", "ils"];

/** Perfect tense with avoir/être: [English, correct French, wrong options] */
export const FRENCH_PERFECT: [string, string, string[]][] = [
  ["I ate", "j'ai mangé", ["je suis mangé", "j'ai manger", "je mange"]],
  ["She went", "elle est allée", ["elle a allé", "elle est aller", "elle va"]],
  ["We finished", "nous avons fini", ["nous sommes finis", "nous finissons", "nous avons finir"]],
  ["They arrived (m)", "ils sont arrivés", ["ils ont arrivé", "ils arrivent", "ils sont arriver"]],
  ["You (vous) saw", "vous avez vu", ["vous êtes vu", "vous voyez", "vous avez voir"]],
  ["He stayed", "il est resté", ["il a resté", "il reste", "il est rester"]],
  ["I did", "j'ai fait", ["je suis fait", "je fais", "j'ai faire"]],
  ["You (tu) took", "tu as pris", ["tu es pris", "tu prends", "tu as prendre"]],
];

/** [Latin, English] */
export const LATIN_VOCAB: [string, string][] = [
  ["puella", "girl"], ["puer", "boy"], ["agricola", "farmer"], ["nauta", "sailor"], ["dominus", "master"],
  ["servus", "slave"], ["amicus", "friend"], ["filius", "son"], ["filia", "daughter"], ["rex", "king"],
  ["regina", "queen"], ["miles", "soldier"], ["dux", "leader"], ["urbs", "city"], ["via", "road"],
  ["silva", "wood / forest"], ["aqua", "water"], ["terra", "land"], ["bellum", "war"], ["templum", "temple"],
  ["donum", "gift"], ["oppidum", "town"], ["murus", "wall"], ["ager", "field"], ["equus", "horse"],
  ["navis", "ship"], ["mare", "sea"], ["nox", "night"], ["dies", "day"], ["deus", "god"],
  ["bonus", "good"], ["malus", "bad"], ["magnus", "big"], ["parvus", "small"], ["multus", "much / many"],
  ["laetus", "happy"], ["iratus", "angry"], ["fessus", "tired"], ["novus", "new"], ["altus", "high / deep"],
  ["amo", "I love"], ["video", "I see"], ["habeo", "I have"], ["moneo", "I warn"], ["rego", "I rule"],
  ["audio", "I hear"], ["venio", "I come"], ["dico", "I say"], ["duco", "I lead"], ["capio", "I take / capture"],
  ["sum", "I am"], ["possum", "I am able"], ["festino", "I hurry"], ["navigo", "I sail"], ["pugno", "I fight"],
  ["et", "and"], ["sed", "but"], ["non", "not"], ["quod", "because"], ["ubi", "where / when"],
];

/** Present tense of amo (1st conjugation): person → ending */
export const LATIN_PRESENT: [string, string][] = [
  ["I love", "amo"], ["you (sg) love", "amas"], ["he/she loves", "amat"], ["we love", "amamus"], ["you (pl) love", "amatis"], ["they love", "amant"],
];
/** First declension (puella): case/number → form */
export const LATIN_PUELLA: [string, string][] = [
  ["nominative singular", "puella"], ["accusative singular", "puellam"], ["genitive singular", "puellae"], ["dative singular", "puellae"], ["ablative singular", "puellā"],
  ["nominative plural", "puellae"], ["accusative plural", "puellas"], ["genitive plural", "puellarum"], ["dative plural", "puellis"], ["ablative plural", "puellis"],
];
/** Short sentences: [Latin, right English, wrong English options] */
export const LATIN_SENTENCES: [string, string, string[]][] = [
  ["puella agricolam amat.", "The girl loves the farmer.", ["The farmer loves the girl.", "The girls love the farmer.", "The girl loved the farmers."]],
  ["servus dominum timet.", "The slave fears the master.", ["The master fears the slave.", "The slaves fear the master.", "The slave is a master."]],
  ["milites oppidum oppugnant.", "The soldiers attack the town.", ["The soldier attacks the towns.", "The town attacks the soldiers.", "The soldiers leave the town."]],
  ["nautae ad insulam navigant.", "The sailors sail to the island.", ["The sailor sails from the island.", "The island sails to the sailors.", "The sailors swim to the island."]],
  ["rex donum reginae dat.", "The king gives a gift to the queen.", ["The queen gives a gift to the king.", "The king gives gifts to the queens.", "The king takes the queen's gift."]],
  ["pueri in silva ambulant.", "The boys walk in the wood.", ["The boy walks into the wood.", "The boys run out of the wood.", "The wood walks with the boys."]],
  ["dux milites ad bellum ducit.", "The leader leads the soldiers to war.", ["The soldiers lead the leader to war.", "The leader leaves the war.", "The leader leads the soldier home."]],
  ["amicus meus laetus est.", "My friend is happy.", ["My friend is angry.", "My friends are happy.", "I am a happy friend."]],
];

/** KS3 vocabulary: [word, meaning, wrong meanings] */
export const KS3_VOCAB: [string, string, string[]][] = [
  ["acrimonious", "angry and bitter", ["sweet-smelling", "very quiet", "full of colour"]],
  ["alleviate", "to make less severe", ["to make worse", "to lift up high", "to announce loudly"]],
  ["ambivalent", "having mixed feelings", ["able to use both hands", "completely certain", "very ambitious"]],
  ["anachronism", "something out of its proper time", ["a type of clock", "a long journey", "a mistake in spelling"]],
  ["arduous", "difficult and tiring", ["passionate", "dry and dusty", "easy and quick"]],
  ["benign", "gentle and harmless", ["dangerous", "nervous", "unknown"]],
  ["cajole", "to persuade by flattery", ["to cage an animal", "to shout angrily", "to cook slowly"]],
  ["candour", "honesty and openness", ["a bright light", "sweetness", "secrecy"]],
  ["capricious", "changing mood suddenly", ["very careful", "goat-like", "generous"]],
  ["clandestine", "secret and hidden", ["noisy", "very clean", "official"]],
  ["complacent", "smugly satisfied, not trying", ["anxious", "helpful", "complicated"]],
  ["conundrum", "a puzzling problem", ["a drum", "a celebration", "a type of hat"]],
  ["cryptic", "mysterious and puzzling", ["frozen", "very clear", "religious"]],
  ["deference", "polite respect", ["difference", "defence", "rudeness"]],
  ["deleterious", "harmful", ["delicious", "deleted", "helpful"]],
  ["didactic", "intended to teach", ["dictated", "doubtful", "decorative"]],
  ["diffident", "shy and lacking confidence", ["different", "bold", "argumentative"]],
  ["disparate", "very different from each other", ["desperate", "similar", "separated by distance"]],
  ["ebullient", "cheerful and full of energy", ["boiling hot", "gloomy", "bullying"]],
  ["enigmatic", "mysterious", ["energetic", "obvious", "enormous"]],
  ["esoteric", "understood by only a few", ["easy to understand", "eastern", "extremely old"]],
  ["exacerbate", "to make worse", ["to make better", "to examine", "to exaggerate a story"]],
  ["fastidious", "very careful about detail", ["fast", "careless", "festive"]],
  ["furtive", "secretive and sly", ["fertile", "open", "angry"]],
  ["garrulous", "very talkative", ["silent", "grumpy", "gigantic"]],
  ["gratuitous", "unnecessary", ["grateful", "free of charge only", "essential"]],
  ["iconoclast", "someone who attacks cherished beliefs", ["a painter of icons", "a type of bird", "a loyal follower"]],
  ["idiosyncratic", "peculiar to one person", ["idiotic", "ordinary", "identical"]],
  ["impetuous", "acting quickly without thinking", ["impatient waiting", "cautious", "impossible"]],
  ["indolent", "lazy", ["indoor", "painful", "hard-working"]],
  ["inexorable", "impossible to stop", ["easily stopped", "unforgivable", "inexpensive"]],
  ["insidious", "harmful in a gradual, hidden way", ["inside", "obvious", "insulting"]],
  ["laconic", "using very few words", ["lazy", "talkative", "lacy"]],
  ["loquacious", "very talkative", ["quiet", "local", "lucky"]],
  ["magnanimous", "generous and forgiving", ["magnetic", "huge", "mean-spirited"]],
  ["meticulous", "extremely careful and precise", ["messy", "metallic", "rushed"]],
  ["mollify", "to calm someone's anger", ["to annoy", "to multiply", "to melt"]],
  ["mundane", "ordinary and dull", ["worldly-wise", "exciting", "on Mondays"]],
  ["nefarious", "wicked", ["nervous", "kind", "nearby"]],
  ["obsequious", "too eager to please", ["obvious", "rude", "obscure"]],
  ["ostentatious", "showy, designed to impress", ["modest", "ancient", "obvious"]],
  ["paradox", "a statement that seems to contradict itself", ["a pair of ducks", "a perfect example", "a type of medicine"]],
  ["pernicious", "having a harmful effect", ["persistent", "precious", "helpful"]],
  ["pragmatic", "practical and realistic", ["dramatic", "idealistic", "grammatical"]],
  ["prosaic", "dull and ordinary", ["poetic", "professional", "prosperous"]],
  ["querulous", "complaining", ["questioning politely", "cheerful", "quarrelsome only with family"]],
  ["recalcitrant", "stubbornly uncooperative", ["obedient", "recently calculated", "recovering"]],
  ["reticent", "reluctant to share feelings", ["retired", "talkative", "returning"]],
  ["sanguine", "optimistic", ["bloodthirsty", "sad", "sandy"]],
  ["scrupulous", "careful to do what is right", ["dishonest", "scruffy", "screaming"]],
  ["superfluous", "more than is needed", ["super-fast", "essential", "superior"]],
  ["taciturn", "saying very little", ["talkative", "tactful", "tasteful"]],
  ["trepidation", "fear and anxiety", ["excitement", "trespassing", "travel"]],
  ["truculent", "eager to argue or fight", ["truthful", "gentle", "truck-like"]],
  ["ubiquitous", "found everywhere", ["unique", "rare", "unknown"]],
  ["vacillate", "to keep changing your mind", ["to vaccinate", "to decide firmly", "to vanish"]],
  ["venerable", "respected because of age or wisdom", ["vulnerable", "venomous", "young and foolish"]],
  ["vindictive", "wanting revenge", ["victorious", "forgiving", "vivid"]],
  ["vociferous", "loud and forceful", ["quiet", "vicious", "voluntary"]],
  ["zealous", "very enthusiastic", ["jealous", "lazy", "zigzagging"]],
];
