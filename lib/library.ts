import { SAMPLES } from "./samples";
import type { Flashcard, Question, StudyNotes } from "./types";

/**
 * The built-in study library: hand-written notes, flashcards and quiz banks for
 * every sample subject. It needs no API key, costs nothing to run, and gives
 * the best possible quality for the subjects most people try first.
 *
 * Each question lists the correct answer first; options are shuffled when a
 * quiz is built, so the answer lands in a different place each time.
 */

export interface LibraryQuestion {
  prompt: string;
  answer: string;
  wrong: [string, string, string];
  explanation: string;
}

export interface LibraryPack {
  slug: string;
  title: string;
  notes: StudyNotes;
  flashcards: Flashcard[];
  questions: LibraryQuestion[];
}

const q = (prompt: string, answer: string, wrong: [string, string, string], explanation: string): LibraryQuestion => ({ prompt, answer, wrong, explanation });
const c = (front: string, back: string): Flashcard => ({ front, back });

const PACKS: LibraryPack[] = [
  {
    slug: "biology",
    title: "Photosynthesis",
    notes: {
      summary:
        "Photosynthesis is how plants turn light energy into chemical energy. It happens in chloroplasts in two stages: the light-dependent reactions make ATP and NADPH and release oxygen, then the Calvin cycle uses them to fix carbon dioxide into sugar.",
      sections: [
        { heading: "Where it happens", points: ["Photosynthesis takes place in the chloroplasts of plant cells", "Chlorophyll is the green pigment that absorbs mostly red and blue light and reflects green", "Word equation: carbon dioxide + water → glucose + oxygen (using light energy)"] },
        { heading: "Light-dependent reactions", points: ["Take place in the thylakoid membranes", "Light energy splits water, releasing oxygen as a by-product", "Produce ATP and NADPH for the next stage"] },
        { heading: "The Calvin cycle", points: ["Runs in the stroma and fixes carbon dioxide into sugar", "The enzyme RuBisCO catalyses the first step of carbon fixation", "Glucose can be stored as starch"] },
        { heading: "Adaptations", points: ["C4 plants such as maize separate carbon fixation and the Calvin cycle into different cells", "CAM plants such as cacti open their stomata at night to reduce water loss", "Light intensity, carbon dioxide and temperature can all limit the rate"] },
      ],
      keyTerms: [
        { term: "Chloroplast", definition: "The organelle where photosynthesis happens" },
        { term: "Chlorophyll", definition: "The green pigment that absorbs light energy, mostly red and blue light" },
        { term: "Thylakoid", definition: "Membranes inside the chloroplast where the light-dependent reactions happen" },
        { term: "Stroma", definition: "The fluid inside the chloroplast where the Calvin cycle runs" },
        { term: "RuBisCO", definition: "The enzyme that catalyses the first step of carbon fixation" },
        { term: "Stomata", definition: "Pores in the leaf that let gases in and out" },
      ],
    },
    flashcards: [
      c("Where in the cell does photosynthesis happen?", "In the chloroplasts"),
      c("What is the word equation for photosynthesis?", "Carbon dioxide + water → glucose + oxygen"),
      c("Which colours of light does chlorophyll absorb most?", "Red and blue"),
      c("Why do leaves look green?", "Chlorophyll reflects green light"),
      c("Where do the light-dependent reactions happen?", "In the thylakoid membranes"),
      c("What two products of the light-dependent reactions does the Calvin cycle use?", "ATP and NADPH"),
      c("Where does the oxygen released in photosynthesis come from?", "Water, split during the light-dependent reactions"),
      c("Where does the Calvin cycle run?", "In the stroma"),
      c("Which enzyme catalyses the first step of carbon fixation?", "RuBisCO"),
      c("How do CAM plants like cacti save water?", "They open their stomata at night"),
      c("Give an example of a C4 plant.", "Maize"),
      c("How do plants store the glucose they make?", "As starch"),
    ],
    questions: [
      q("Where in a plant cell does photosynthesis take place?", "Chloroplasts", ["Mitochondria", "Nucleus", "Ribosomes"], "Chloroplasts contain chlorophyll and are where light energy is captured."),
      q("Which pigment absorbs light for photosynthesis?", "Chlorophyll", ["Haemoglobin", "Melanin", "Keratin"], "Chlorophyll is the green pigment in chloroplasts."),
      q("Which colours of light does chlorophyll absorb most?", "Red and blue", ["Green and yellow", "Green only", "Orange and violet"], "It absorbs red and blue and reflects green, which is why leaves look green."),
      q("Where do the light-dependent reactions happen?", "Thylakoid membranes", ["Stroma", "Cell wall", "Vacuole"], "The thylakoid membranes hold the chlorophyll that captures light."),
      q("What gas is released when water is split in photosynthesis?", "Oxygen", ["Carbon dioxide", "Nitrogen", "Hydrogen sulfide"], "Splitting water in the light-dependent reactions releases oxygen as a by-product."),
      q("Which two products of the light-dependent reactions power the Calvin cycle?", "ATP and NADPH", ["Glucose and oxygen", "Water and CO₂", "Starch and ATP"], "ATP gives energy and NADPH gives the reducing power to make sugar."),
      q("Where does the Calvin cycle run?", "Stroma", ["Thylakoid membranes", "Nucleus", "Cytoplasm of root cells"], "The Calvin cycle runs in the stroma, the fluid around the thylakoids."),
      q("What does the Calvin cycle fix into sugar?", "Carbon dioxide", ["Oxygen", "Nitrogen", "Water vapour"], "Carbon fixation turns carbon dioxide from the air into sugar."),
      q("Which enzyme catalyses the first step of carbon fixation?", "RuBisCO", ["Amylase", "Lipase", "Catalase"], "RuBisCO joins carbon dioxide to a five-carbon compound at the start of the Calvin cycle."),
      q("Which is an example of a C4 plant?", "Maize", ["Cactus", "Oak tree", "Moss"], "C4 plants like maize separate carbon fixation and the Calvin cycle into different cells."),
      q("Why do CAM plants such as cacti open their stomata at night?", "To reduce water loss", ["To catch more light", "To release starch", "To absorb nitrogen"], "Nights are cooler and more humid, so less water evaporates through open stomata."),
      q("How is glucose from photosynthesis stored?", "As starch", ["As protein", "As fat in the roots only", "As chlorophyll"], "Glucose is joined into starch, which is insoluble and easy to store."),
      q("Which is the correct word equation for photosynthesis?", "Carbon dioxide + water → glucose + oxygen", ["Glucose + oxygen → carbon dioxide + water", "Oxygen + water → glucose + carbon dioxide", "Glucose → carbon dioxide + water"], "Plants take in carbon dioxide and water and use light energy to make glucose and oxygen."),
      q("If a plant gets brighter light but nothing else changes, what usually happens to the rate of photosynthesis?", "It increases, until another factor limits it", ["It stops completely", "It always falls", "It is unaffected by light"], "Light intensity is a limiting factor until carbon dioxide or temperature becomes the limit."),
      q("Why do leaves look green?", "Chlorophyll reflects green light", ["Leaves absorb green light", "Starch is green", "Oxygen is green"], "The green light that chlorophyll doesn't absorb is reflected into our eyes."),
    ],
  },
  {
    slug: "chemistry",
    title: "Atoms and the periodic table",
    notes: {
      summary:
        "Atoms have a nucleus of protons and neutrons surrounded by electrons. The number of protons identifies the element, and the outer-shell electrons decide how it reacts, which is why elements in the same group behave alike.",
      sections: [
        { heading: "Inside the atom", points: ["The nucleus contains protons (+1) and neutrons (0); electrons (−1) surround it", "Atomic number = number of protons", "Mass number = protons + neutrons", "Isotopes have the same number of protons but different numbers of neutrons"] },
        { heading: "The periodic table", points: ["Elements in the same group have the same number of outer-shell electrons", "Group 0 noble gases are unreactive because their outer shells are full", "Group 1 alkali metals get more reactive further down the group", "Mendeleev arranged his table in 1869 and left gaps for undiscovered elements"] },
        { heading: "Bonding", points: ["Ionic bonds form when electrons transfer from a metal to a non-metal", "Covalent bonds are shared pairs of electrons between non-metal atoms"] },
      ],
      keyTerms: [
        { term: "Atomic number", definition: "The number of protons in the nucleus" },
        { term: "Mass number", definition: "The number of protons plus neutrons" },
        { term: "Isotope", definition: "An atom of the same element with a different number of neutrons" },
        { term: "Group", definition: "A column of the periodic table; members share the same number of outer electrons" },
        { term: "Ionic bond", definition: "A bond formed by transferring electrons from a metal to a non-metal" },
        { term: "Covalent bond", definition: "A shared pair of electrons between two non-metal atoms" },
      ],
    },
    flashcards: [
      c("What particles are in the nucleus?", "Protons and neutrons"),
      c("What is the charge of an electron?", "−1"),
      c("What does the atomic number tell you?", "The number of protons"),
      c("How do you work out the mass number?", "Protons + neutrons"),
      c("What are isotopes?", "Atoms of the same element with different numbers of neutrons"),
      c("What do elements in the same group have in common?", "The same number of outer-shell electrons"),
      c("Why are the noble gases unreactive?", "Their outer shells are full"),
      c("What happens to Group 1 reactivity going down the group?", "It increases"),
      c("How does an ionic bond form?", "Electrons transfer from a metal to a non-metal"),
      c("What is a covalent bond?", "A shared pair of electrons between non-metal atoms"),
      c("Who arranged the periodic table in 1869?", "Dmitri Mendeleev"),
      c("Why did Mendeleev leave gaps in his table?", "For elements that hadn't been discovered yet"),
    ],
    questions: [
      q("Which particles are found in the nucleus of an atom?", "Protons and neutrons", ["Electrons and protons", "Electrons only", "Neutrons and electrons"], "Electrons orbit outside the nucleus."),
      q("What does the atomic number of an element tell you?", "The number of protons", ["The number of neutrons", "Protons plus neutrons", "The number of outer electrons"], "Each element has a unique number of protons."),
      q("An atom has 11 protons and 12 neutrons. What is its mass number?", "23", ["11", "12", "1"], "Mass number = protons + neutrons = 11 + 12."),
      q("What are isotopes?", "Atoms of the same element with different numbers of neutrons", ["Atoms with different numbers of protons", "Atoms that have lost electrons", "Elements in the same group"], "Isotopes keep the same proton number, so they are the same element."),
      q("What is the charge on an electron?", "−1", ["+1", "0", "+2"], "Protons are +1, neutrons are neutral and electrons are −1."),
      q("Elements in the same group of the periodic table have the same…", "Number of outer-shell electrons", ["Mass number", "Number of neutrons", "Melting point"], "Outer electrons control how an element reacts, so groups behave similarly."),
      q("Why are the noble gases unreactive?", "They have full outer shells", ["They have no electrons", "They are metals", "They have no protons"], "With a full outer shell they don't need to gain, lose or share electrons."),
      q("Which group are the noble gases in?", "Group 0", ["Group 1", "Group 2", "Group 7"], "The noble gases form the final column, Group 0 (sometimes called Group 8)."),
      q("What happens to the reactivity of alkali metals going down Group 1?", "It increases", ["It decreases", "It stays the same", "They stop reacting"], "The outer electron is further from the nucleus, so it is lost more easily."),
      q("How does an ionic bond form?", "Electrons transfer from a metal to a non-metal", ["Two non-metals share electrons", "Protons move between atoms", "Neutrons are shared"], "The metal becomes a positive ion and the non-metal a negative ion."),
      q("What is a covalent bond?", "A shared pair of electrons between non-metal atoms", ["A transfer of electrons from a metal", "Attraction between protons", "A bond between two metals only"], "Non-metal atoms share electrons so both can fill their outer shells."),
      q("Which pair would most likely form an ionic bond?", "Sodium and chlorine", ["Carbon and oxygen", "Hydrogen and hydrogen", "Neon and argon"], "Sodium is a metal and chlorine a non-metal, so an electron transfers."),
      q("In what year did Mendeleev publish his periodic table?", "1869", ["1789", "1912", "1905"], "Dmitri Mendeleev arranged the elements in 1869."),
      q("Why did Mendeleev leave gaps in his periodic table?", "For elements not yet discovered", ["To make it look neat", "Because some elements were radioactive", "To separate metals from gases"], "He predicted that missing elements would be found, and they were."),
      q("Carbon-12 and carbon-14 both have 6 protons. What makes them different?", "The number of neutrons", ["The number of protons", "Their atomic number", "Their number of electrons in a neutral atom"], "They are isotopes: 6 and 8 neutrons respectively."),
    ],
  },
  {
    slug: "history",
    title: "The French Revolution",
    notes: {
      summary:
        "The French Revolution began in 1789 when a financial crisis forced Louis XVI to call the Estates-General. It overthrew the monarchy, passed through the radical Reign of Terror under Robespierre, and ended when Napoleon seized power in 1799.",
      sections: [
        { heading: "Causes and outbreak (1789)", points: ["A severe financial crisis led Louis XVI to summon the Estates-General", "The storming of the Bastille on 14 July 1789 marked the start of the revolution", "The Declaration of the Rights of Man was adopted in August 1789"] },
        { heading: "Radical phase", points: ["The Jacobins were the most radical political club", "Louis XVI was executed in 1793", "Robespierre led the Committee of Public Safety during the Reign of Terror", "Thousands were executed by guillotine"] },
        { heading: "The end", points: ["Napoleon Bonaparte seized power in the coup of 18 Brumaire in 1799"] },
      ],
      keyTerms: [
        { term: "Bastille", definition: "A royal fortress and prison in Paris, stormed on 14 July 1789" },
        { term: "Estates-General", definition: "An assembly of the three estates (clergy, nobles, commoners) called in 1789" },
        { term: "Jacobins", definition: "The most radical political club of the revolution" },
        { term: "Reign of Terror", definition: "The period (1793–94) when thousands of suspected enemies were executed" },
        { term: "Committee of Public Safety", definition: "The body, led by Robespierre, that ran France during the Terror" },
        { term: "18 Brumaire", definition: "The 1799 coup in which Napoleon took power" },
      ],
    },
    flashcards: [
      c("In what year did the French Revolution begin?", "1789"),
      c("What event marked the start of the revolution?", "The storming of the Bastille (14 July 1789)"),
      c("Who was king of France when the revolution started?", "Louis XVI"),
      c("Why was the Estates-General summoned in 1789?", "To deal with a severe financial crisis"),
      c("When was the Declaration of the Rights of Man adopted?", "August 1789"),
      c("Who led the Committee of Public Safety?", "Maximilien Robespierre"),
      c("What was the Reign of Terror?", "A period when thousands of suspected enemies were executed"),
      c("How were most people executed during the Terror?", "By guillotine"),
      c("Who were the Jacobins?", "The most radical political club of the revolution"),
      c("Who seized power in 1799?", "Napoleon Bonaparte"),
      c("What was the coup of 18 Brumaire?", "Napoleon's seizure of power in 1799"),
      c("What happened to Louis XVI in 1793?", "He was executed"),
    ],
    questions: [
      q("In what year did the French Revolution begin?", "1789", ["1776", "1799", "1815"], "The storming of the Bastille in July 1789 marks the start."),
      q("Which event is usually seen as the start of the revolution?", "The storming of the Bastille", ["The execution of Louis XVI", "The coup of 18 Brumaire", "The Battle of Waterloo"], "Crowds stormed the Bastille prison in Paris on 14 July 1789."),
      q("Who was king of France when the revolution started?", "Louis XVI", ["Louis XIV", "Napoleon Bonaparte", "Charles X"], "Louis XVI reigned from 1774 until the monarchy fell."),
      q("Why was the Estates-General summoned in 1789?", "To deal with a severe financial crisis", ["To declare war on Britain", "To crown Napoleon", "To abolish the guillotine"], "France was nearly bankrupt and the king needed new taxes."),
      q("When was the Declaration of the Rights of Man adopted?", "August 1789", ["July 1799", "January 1793", "June 1815"], "It set out rights such as liberty and equality before the law."),
      q("Who led the Committee of Public Safety during the Reign of Terror?", "Maximilien Robespierre", ["Napoleon Bonaparte", "Louis XVI", "Marie Antoinette"], "Robespierre dominated the committee until his own execution in 1794."),
      q("What was the Reign of Terror?", "A period when thousands of suspected enemies were executed", ["A war against Austria", "Napoleon's rule as emperor", "A famine in 1789"], "Suspected opponents of the revolution were tried and executed."),
      q("What method of execution is most linked to the Terror?", "The guillotine", ["Hanging", "Firing squad", "Burning at the stake"], "The guillotine was used for thousands of executions."),
      q("Who were the Jacobins?", "The most radical political club", ["The king's bodyguard", "A group of nobles who fled France", "Napoleon's generals"], "The Jacobins pushed for a republic and supported the Terror."),
      q("What happened to Louis XVI in 1793?", "He was executed", ["He became emperor", "He fled to England", "He wrote the Declaration"], "Louis XVI was tried for treason and guillotined in January 1793."),
      q("Who seized power in the coup of 18 Brumaire?", "Napoleon Bonaparte", ["Robespierre", "Louis XVI", "The Jacobins"], "Napoleon took control of the government in 1799."),
      q("In what year did Napoleon seize power?", "1799", ["1789", "1793", "1804"], "The coup of 18 Brumaire took place in November 1799."),
      q("Put these in order: Bastille stormed, Louis XVI executed, Napoleon seizes power.", "1789, 1793, 1799", ["1793, 1789, 1799", "1799, 1789, 1793", "1789, 1799, 1793"], "Bastille in 1789, the king's execution in 1793, Napoleon's coup in 1799."),
      q("Which body was called first when the crisis began in 1789?", "The Estates-General", ["The Committee of Public Safety", "The Jacobin Club", "The Directory"], "The Estates-General met in May 1789, before the Bastille fell."),
      q("Which idea is most closely linked to the Declaration of the Rights of Man?", "Equality before the law", ["The divine right of kings", "Rule by the Church", "Napoleon as emperor"], "It declared that men are born free and equal in rights."),
    ],
  },
  {
    slug: "languages",
    title: "Spanish: everyday basics",
    notes: {
      summary:
        "Spanish basics: greetings and polite phrases, nouns that are masculine (el) or feminine (la), adjectives after the noun, and two verbs for 'to be': ser for permanent traits and estar for states and places.",
      sections: [
        { heading: "Greetings and phrases", points: ["Hola = hello; adiós = goodbye", "Gracias = thank you; de nada = you're welcome", "¿Cómo te llamas? = what's your name?; Me llamo Ana = my name is Ana", "Por favor = please; buenos días = good morning"] },
        { heading: "Grammar", points: ["Every noun is masculine or feminine", "Masculine nouns usually take el (el libro = the book)", "Feminine nouns usually take la (la mesa = the table)", "Adjectives usually come after the noun: una casa grande = a big house", "Questions start with an upside-down question mark: ¿…?"] },
        { heading: "Verbs", points: ["Ser = to be, for permanent traits like nationality", "Estar = to be, for temporary states and locations", "Hablar = to speak: yo hablo, tú hablas, nosotros hablamos"] },
      ],
      keyTerms: [
        { term: "Hola", definition: "Hello" },
        { term: "Gracias", definition: "Thank you" },
        { term: "De nada", definition: "You're welcome" },
        { term: "Ser", definition: "To be, for permanent traits such as nationality" },
        { term: "Estar", definition: "To be, for temporary states and locations" },
        { term: "Hablar", definition: "To speak (a regular -ar verb)" },
      ],
    },
    flashcards: [
      c("Hola", "Hello"),
      c("Adiós", "Goodbye"),
      c("Gracias", "Thank you"),
      c("De nada", "You're welcome"),
      c("How do you ask someone their name?", "¿Cómo te llamas?"),
      c("How do you say 'my name is Ana'?", "Me llamo Ana"),
      c("El libro", "The book (masculine)"),
      c("La mesa", "The table (feminine)"),
      c("How do you say 'a big house'?", "Una casa grande"),
      c("When do you use ser?", "For permanent traits, like nationality"),
      c("When do you use estar?", "For temporary states and locations"),
      c("Yo hablo / nosotros hablamos", "I speak / we speak"),
    ],
    questions: [
      q("What does 'hola' mean?", "Hello", ["Goodbye", "Please", "Thank you"], "Hola is the everyday Spanish greeting."),
      q("What does 'adiós' mean?", "Goodbye", ["Hello", "Sorry", "Good morning"], "Adiós is used when leaving."),
      q("How do you say 'thank you' in Spanish?", "Gracias", ["De nada", "Por favor", "Hola"], "Gracias = thank you; the reply is de nada."),
      q("What is the polite reply to 'gracias'?", "De nada", ["Adiós", "Me llamo", "Buenos días"], "De nada means you're welcome."),
      q("What does '¿Cómo te llamas?' ask?", "What's your name?", ["How old are you?", "Where are you from?", "How are you?"], "Llamarse means to be called, so it asks what you're called."),
      q("How do you say 'my name is Ana'?", "Me llamo Ana", ["Yo hablo Ana", "Soy de Ana", "Ana se habla"], "Me llamo literally means 'I call myself'."),
      q("Which word for 'the' goes with 'libro' (book)?", "El", ["La", "Las", "Una"], "Libro is masculine, so it takes el."),
      q("Which word for 'the' goes with 'mesa' (table)?", "La", ["El", "Los", "Un"], "Mesa is feminine, so it takes la."),
      q("How do you say 'a big house'?", "Una casa grande", ["Una grande casa", "Un casa grande", "La grande casa"], "Spanish adjectives usually come after the noun."),
      q("How does a written Spanish question begin?", "With an upside-down question mark (¿)", ["With a capital Q", "With an exclamation mark", "With no punctuation"], "Spanish questions open with ¿ and close with ?."),
      q("Which verb is used for permanent traits like nationality?", "Ser", ["Estar", "Hablar", "Llamar"], "Ser describes what something is; estar describes states and places."),
      q("Which verb would you use to say where something is?", "Estar", ["Ser", "Hablar", "Tener"], "Estar is used for locations and temporary states."),
      q("What does 'hablar' mean?", "To speak", ["To eat", "To live", "To be"], "Hablar is a regular -ar verb."),
      q("What does 'nosotros hablamos' mean?", "We speak", ["I speak", "They speak", "You speak"], "Nosotros = we, and -amos is the 'we' ending for -ar verbs."),
      q("Which is the 'I' form of hablar?", "Yo hablo", ["Yo hablas", "Yo hablamos", "Yo hablar"], "For regular -ar verbs, the 'I' form ends in -o."),
    ],
  },
  {
    slug: "physics",
    title: "Newton's laws of motion",
    notes: {
      summary:
        "Newton's three laws explain how forces change motion: objects keep doing what they're doing unless a resultant force acts, force equals mass times acceleration, and every action has an equal and opposite reaction.",
      sections: [
        { heading: "The three laws", points: ["First law: an object stays at rest or at constant velocity unless a resultant force acts on it", "Second law: F = m × a", "Third law: every action has an equal and opposite reaction"] },
        { heading: "Units and quantities", points: ["Force in newtons (N), mass in kilograms (kg), acceleration in m/s²", "Weight = mass × gravitational field strength (about 9.8 N/kg on Earth)", "Momentum = mass × velocity, and it is conserved in collisions"] },
        { heading: "Other forces", points: ["Inertia is the tendency to resist changes in motion", "Friction opposes motion between surfaces in contact"] },
      ],
      keyTerms: [
        { term: "Inertia", definition: "The tendency of an object to resist changes to its motion" },
        { term: "Resultant force", definition: "The single force that has the same effect as all the forces acting together" },
        { term: "Newton (N)", definition: "The unit of force" },
        { term: "Weight", definition: "The force of gravity on a mass (W = m × g)" },
        { term: "Friction", definition: "A force that opposes motion between surfaces in contact" },
        { term: "Momentum", definition: "Mass × velocity; conserved in collisions" },
      ],
    },
    flashcards: [
      c("State Newton's first law.", "An object stays at rest or at constant velocity unless a resultant force acts"),
      c("What is inertia?", "The tendency to resist changes in motion"),
      c("State Newton's second law as an equation.", "F = m × a"),
      c("What is the unit of force?", "The newton (N)"),
      c("What is the unit of acceleration?", "Metres per second squared (m/s²)"),
      c("State Newton's third law.", "Every action has an equal and opposite reaction"),
      c("What is weight?", "The force of gravity on a mass"),
      c("What is g on Earth?", "About 9.8 N/kg"),
      c("What does friction do?", "Opposes motion between surfaces in contact"),
      c("How do you calculate momentum?", "Mass × velocity"),
      c("What happens to momentum in a collision?", "It is conserved"),
      c("A 2 kg mass accelerates at 3 m/s². What is the force?", "6 N"),
    ],
    questions: [
      q("What does Newton's first law say about an object with no resultant force on it?", "It stays at rest or keeps moving at constant velocity", ["It always slows down", "It speeds up", "It starts spinning"], "Without a resultant force, motion doesn't change."),
      q("What is inertia?", "The tendency to resist changes in motion", ["A type of friction", "The pull of gravity", "Energy stored in a spring"], "More massive objects have more inertia."),
      q("Which equation is Newton's second law?", "F = m × a", ["F = m ÷ a", "F = m + a", "a = F × m"], "Force equals mass multiplied by acceleration."),
      q("A 2 kg trolley accelerates at 3 m/s². What resultant force acts on it?", "6 N", ["1.5 N", "5 N", "0.67 N"], "F = m × a = 2 × 3 = 6 N."),
      q("What is the unit of force?", "Newton (N)", ["Joule (J)", "Kilogram (kg)", "Watt (W)"], "Force is measured in newtons."),
      q("What is the unit of acceleration?", "m/s²", ["m/s", "N/kg²", "kg·m"], "Acceleration is change in velocity per second, in metres per second squared."),
      q("Which statement is Newton's third law?", "Every action has an equal and opposite reaction", ["Force equals mass times acceleration", "Objects at rest stay at rest", "Energy cannot be created"], "When you push a wall, the wall pushes back equally."),
      q("What is weight?", "The force of gravity acting on a mass", ["The amount of matter in an object", "The space an object takes up", "Mass times velocity"], "Weight is a force, measured in newtons."),
      q("About how much does a 10 kg mass weigh on Earth?", "98 N", ["10 N", "9.8 N", "980 N"], "W = m × g = 10 × 9.8 = 98 N."),
      q("What does friction do?", "Opposes motion between surfaces in contact", ["Speeds objects up", "Only acts in space", "Increases an object's mass"], "Friction acts in the opposite direction to motion."),
      q("How is momentum calculated?", "Mass × velocity", ["Mass × acceleration", "Force × distance", "Velocity ÷ time"], "Momentum (p) = mass (m) × velocity (v)."),
      q("A 5 kg ball moves at 4 m/s. What is its momentum?", "20 kg m/s", ["1.25 kg m/s", "9 kg m/s", "80 kg m/s"], "p = m × v = 5 × 4 = 20 kg m/s."),
      q("What happens to the total momentum in a collision (with no outside forces)?", "It is conserved", ["It doubles", "It becomes zero", "It is turned into mass"], "Momentum before equals momentum after."),
      q("If the same force acts on a heavier object, what happens to its acceleration?", "It is smaller", ["It is bigger", "It is the same", "It becomes zero"], "From a = F ÷ m, a bigger mass means less acceleration."),
      q("A car moves at a steady 30 m/s in a straight line. What is the resultant force on it?", "Zero", ["30 N forwards", "Equal to its weight", "It depends on its colour"], "Constant velocity means the forces are balanced (Newton's first law)."),
    ],
  },
  {
    slug: "geography",
    title: "Plate tectonics",
    notes: {
      summary:
        "The Earth's crust is split into tectonic plates moved by convection currents in the mantle. Most earthquakes and volcanoes happen where plates meet, at constructive, destructive or conservative boundaries.",
      sections: [
        { heading: "Plates and why they move", points: ["The crust is broken into large pieces called tectonic plates", "Convection currents in the mantle are thought to move them", "Wegener proposed continental drift in 1912"] },
        { heading: "Plate boundaries", points: ["Constructive: plates move apart and new crust forms", "Destructive: an oceanic plate sinks beneath a continental plate (subduction)", "Conservative: plates slide past each other, e.g. the San Andreas Fault"] },
        { heading: "Hazards", points: ["Most earthquakes and volcanoes are along plate boundaries", "The Richter scale measures earthquake magnitude"] },
      ],
      keyTerms: [
        { term: "Tectonic plate", definition: "A large piece of the Earth's crust" },
        { term: "Convection current", definition: "Movement in the mantle that is thought to drive the plates" },
        { term: "Subduction", definition: "When an oceanic plate sinks beneath a continental plate" },
        { term: "Constructive boundary", definition: "Where plates move apart and new crust forms" },
        { term: "Conservative boundary", definition: "Where plates slide past each other" },
        { term: "Richter scale", definition: "A scale that measures the magnitude of an earthquake" },
      ],
    },
    flashcards: [
      c("What are tectonic plates?", "Large pieces of the Earth's crust"),
      c("What is thought to move the plates?", "Convection currents in the mantle"),
      c("What happens at a constructive boundary?", "Plates move apart and new crust forms"),
      c("What happens at a destructive boundary?", "An oceanic plate sinks under a continental plate"),
      c("What is subduction?", "One plate sinking beneath another"),
      c("What happens at a conservative boundary?", "Plates slide past each other"),
      c("Give an example of a conservative boundary.", "The San Andreas Fault"),
      c("Where are most earthquakes and volcanoes found?", "Along plate boundaries"),
      c("What does the Richter scale measure?", "Earthquake magnitude"),
      c("Who proposed continental drift?", "Alfred Wegener"),
      c("When was continental drift proposed?", "1912"),
      c("Why does oceanic crust sink below continental crust?", "It is denser"),
    ],
    questions: [
      q("What are tectonic plates?", "Large pieces of the Earth's crust", ["Layers of the atmosphere", "Ocean currents", "Pieces of the inner core"], "The crust is broken into plates that move slowly."),
      q("What is thought to drive the movement of tectonic plates?", "Convection currents in the mantle", ["The Moon's gravity", "Wind", "Ocean tides"], "Heat from the core makes the mantle circulate slowly."),
      q("What happens at a constructive plate boundary?", "Plates move apart and new crust forms", ["Plates collide and one sinks", "Plates slide past each other", "Plates stop moving"], "Magma rises to fill the gap, e.g. the Mid-Atlantic Ridge."),
      q("What is subduction?", "An oceanic plate sinking beneath a continental plate", ["Plates sliding past each other", "New crust forming", "An earthquake's aftershock"], "Denser oceanic crust sinks into the mantle at destructive boundaries."),
      q("At which boundary does subduction happen?", "Destructive", ["Constructive", "Conservative", "Collision-free"], "Destructive boundaries destroy crust as one plate sinks."),
      q("What happens at a conservative plate boundary?", "Plates slide past each other", ["Plates move apart", "One plate sinks", "Volcanoes always erupt"], "Crust is neither created nor destroyed."),
      q("Which is an example of a conservative boundary?", "The San Andreas Fault", ["The Mid-Atlantic Ridge", "Mount Fuji", "The Sahara Desert"], "The Pacific and North American plates slide past each other in California."),
      q("Where are most earthquakes and volcanoes found?", "Along plate boundaries", ["In the middle of plates", "Only near the equator", "Only in deserts"], "Plate movement builds up stress and lets magma rise at boundaries."),
      q("What does the Richter scale measure?", "The magnitude of an earthquake", ["Wind speed", "Volcano height", "Rainfall"], "Each whole number is a big step up in energy released."),
      q("Who proposed the theory of continental drift?", "Alfred Wegener", ["Charles Darwin", "Isaac Newton", "Dmitri Mendeleev"], "Wegener noticed the continents fit together like a jigsaw."),
      q("In what year was continental drift proposed?", "1912", ["1869", "1789", "1968"], "Alfred Wegener put forward the idea in 1912."),
      q("Why does oceanic crust sink beneath continental crust?", "It is denser", ["It is hotter", "It is thicker", "It is older than the Earth"], "Denser oceanic crust is pulled down into the mantle."),
      q("Which boundary type is most likely to form new ocean floor?", "Constructive", ["Destructive", "Conservative", "None of them"], "As plates move apart, magma cools to form new crust."),
      q("Which layer of the Earth do convection currents move through?", "Mantle", ["Crust", "Inner core", "Atmosphere"], "The mantle is hot enough to flow very slowly."),
      q("Which evidence supported continental drift?", "Matching coastlines and fossils on different continents", ["The Moon's phases", "The water cycle", "Seasons changing"], "South America and Africa fit together and share fossils."),
    ],
  },
  {
    slug: "economics",
    title: "Supply and demand",
    notes: {
      summary:
        "Prices are set where demand meets supply. When price is above equilibrium there's a surplus; below it there's a shortage. Elasticity measures how strongly demand reacts to price changes.",
      sections: [
        { heading: "Demand and supply", points: ["Demand: quantity consumers are willing and able to buy at each price", "Law of demand: as price rises, quantity demanded falls", "Supply: quantity producers are willing and able to sell at each price", "As price rises, quantity supplied usually rises"] },
        { heading: "Equilibrium", points: ["Equilibrium price: quantity demanded equals quantity supplied", "Surplus: price above equilibrium, supply exceeds demand", "Shortage: price below equilibrium, demand exceeds supply"] },
        { heading: "Related ideas", points: ["Price elasticity of demand measures how responsive demand is to price", "Substitutes can replace each other, e.g. tea and coffee", "Complements are used together, e.g. cars and petrol"] },
      ],
      keyTerms: [
        { term: "Demand", definition: "The quantity consumers are willing and able to buy at each price" },
        { term: "Supply", definition: "The quantity producers are willing and able to sell at each price" },
        { term: "Equilibrium price", definition: "The price where quantity demanded equals quantity supplied" },
        { term: "Surplus", definition: "Excess supply, when price is above equilibrium" },
        { term: "Shortage", definition: "Excess demand, when price is below equilibrium" },
        { term: "Price elasticity of demand", definition: "How responsive demand is to a change in price" },
      ],
    },
    flashcards: [
      c("What is demand?", "The quantity consumers are willing and able to buy at each price"),
      c("State the law of demand.", "As price rises, quantity demanded falls"),
      c("What is supply?", "The quantity producers are willing and able to sell at each price"),
      c("What is the equilibrium price?", "Where quantity demanded equals quantity supplied"),
      c("When does a surplus occur?", "When price is above equilibrium"),
      c("When does a shortage occur?", "When price is below equilibrium"),
      c("What does price elasticity of demand measure?", "How responsive demand is to a price change"),
      c("What are substitutes?", "Goods that can replace each other, e.g. tea and coffee"),
      c("What are complements?", "Goods used together, e.g. cars and petrol"),
      c("If coffee gets more expensive, what may happen to demand for tea?", "It rises"),
      c("What happens to quantity supplied when price rises?", "It usually rises"),
      c("What usually happens to price when there's a shortage?", "It rises"),
    ],
    questions: [
      q("What is demand?", "The quantity consumers are willing and able to buy at each price", ["The amount producers make", "The total money in an economy", "The price set by the government"], "Demand needs both willingness and ability to pay."),
      q("What does the law of demand say?", "As price rises, quantity demanded falls", ["As price rises, demand rises", "Price never changes demand", "Supply always equals demand"], "Higher prices put some buyers off."),
      q("What is supply?", "The quantity producers are willing and able to sell at each price", ["The amount consumers want", "Money saved in banks", "Goods imported from abroad"], "Supply is the producers' side of the market."),
      q("What is the equilibrium price?", "Where quantity demanded equals quantity supplied", ["The highest possible price", "The price with the most profit", "The price set by shops"], "At equilibrium the market clears."),
      q("If the price is above equilibrium, what happens?", "A surplus: supply exceeds demand", ["A shortage", "Demand exceeds supply", "Nothing changes"], "Sellers can't sell everything at that price."),
      q("If the price is below equilibrium, what happens?", "A shortage: demand exceeds supply", ["A surplus", "Supply exceeds demand", "Prices must fall further"], "Buyers want more than is available."),
      q("What usually happens to price when there is a surplus?", "It falls", ["It rises", "It stays fixed forever", "It doubles"], "Sellers cut prices to clear unsold stock."),
      q("What does price elasticity of demand measure?", "How responsive demand is to a change in price", ["How fast prices rise", "How much a firm can produce", "The cost of making a good"], "Elastic demand changes a lot when price changes."),
      q("Which pair are substitutes?", "Tea and coffee", ["Cars and petrol", "Printers and ink", "Bread and butter"], "Substitutes can replace each other."),
      q("Which pair are complements?", "Cars and petrol", ["Tea and coffee", "Pepsi and Coca-Cola", "Butter and margarine"], "Complements are used together."),
      q("The price of coffee rises sharply. What is likely to happen to demand for tea?", "It rises", ["It falls", "It stays the same", "Tea stops being sold"], "Some coffee drinkers switch to the substitute."),
      q("As price rises, what usually happens to quantity supplied?", "It rises", ["It falls", "It becomes zero", "It doesn't change"], "Higher prices make selling more profitable."),
      q("A concert has 5,000 tickets but 9,000 people want them at the set price. What is this?", "A shortage", ["A surplus", "Equilibrium", "Elastic supply"], "Demand (9,000) exceeds supply (5,000)."),
      q("Which good is likely to have inelastic demand?", "Petrol", ["A particular brand of crisps", "Concert tickets for an unknown band", "A luxury holiday"], "People need petrol, so demand changes little when price rises."),
      q("What two things must consumers have for it to count as demand?", "Willingness and ability to pay", ["A job and a car", "A shop and a website", "Savings and a loan"], "Wanting something isn't enough without the money to buy it."),
    ],
  },
  {
    slug: "psychology",
    title: "How memory works",
    notes: {
      summary:
        "The multi-store model says information moves from sensory memory to short-term memory and, with rehearsal, into long-term memory. The working memory model splits short-term memory into parts, and spaced repetition beats forgetting.",
      sections: [
        { heading: "The multi-store model (Atkinson & Shiffrin, 1968)", points: ["Sensory memory holds information for less than a second", "Short-term memory holds about 7 items for around 18–30 seconds", "Rehearsal moves information into long-term memory", "Long-term memory has potentially unlimited capacity and duration"] },
        { heading: "Working memory (Baddeley & Hitch, 1974)", points: ["Short-term memory is an active workspace", "A central executive directs attention between its parts"] },
        { heading: "Forgetting and remembering", points: ["Ebbinghaus described the forgetting curve", "Spaced repetition reviews material at increasing intervals to improve recall"] },
      ],
      keyTerms: [
        { term: "Multi-store model", definition: "Atkinson and Shiffrin's model of sensory, short-term and long-term memory (1968)" },
        { term: "Rehearsal", definition: "Repeating information to transfer it to long-term memory" },
        { term: "Capacity", definition: "How much information a memory store can hold" },
        { term: "Duration", definition: "How long a memory store can hold information" },
        { term: "Working memory model", definition: "Baddeley and Hitch's model of short-term memory as an active workspace (1974)" },
        { term: "Spaced repetition", definition: "Reviewing material at increasing intervals to improve recall" },
      ],
    },
    flashcards: [
      c("Who proposed the multi-store model, and when?", "Atkinson and Shiffrin, 1968"),
      c("How long does sensory memory last?", "Less than a second"),
      c("What is the capacity of short-term memory?", "About 7 items"),
      c("How long does short-term memory last?", "Around 18–30 seconds"),
      c("What moves information into long-term memory?", "Rehearsal"),
      c("What is the capacity of long-term memory?", "Potentially unlimited"),
      c("Who proposed the working memory model, and when?", "Baddeley and Hitch, 1974"),
      c("What part of working memory directs attention?", "The central executive"),
      c("Who described the forgetting curve?", "Hermann Ebbinghaus"),
      c("What is spaced repetition?", "Reviewing at increasing intervals"),
      c("What does 'duration' mean in memory research?", "How long information is held"),
      c("What does 'capacity' mean in memory research?", "How much information can be held"),
    ],
    questions: [
      q("Who proposed the multi-store model of memory?", "Atkinson and Shiffrin", ["Baddeley and Hitch", "Hermann Ebbinghaus", "Sigmund Freud"], "They proposed it in 1968."),
      q("In what year was the multi-store model proposed?", "1968", ["1974", "1885", "1912"], "Atkinson and Shiffrin published it in 1968."),
      q("How long does sensory memory hold information?", "Less than a second", ["About 30 seconds", "A few hours", "A lifetime"], "Sensory memory is very brief unless we pay attention."),
      q("What is the approximate capacity of short-term memory?", "About 7 items", ["About 2 items", "About 100 items", "Unlimited"], "Miller suggested 7 plus or minus 2."),
      q("How long does short-term memory last without rehearsal?", "About 18–30 seconds", ["Less than a second", "About a week", "Forever"], "Unrehearsed information fades quickly."),
      q("What transfers information from short-term to long-term memory?", "Rehearsal", ["Sleep only", "Forgetting", "Sensory input"], "Repeating information helps it stick."),
      q("What is the capacity of long-term memory?", "Potentially unlimited", ["About 7 items", "Less than a second", "About 30 items"], "Long-term memory has no known limit."),
      q("Who proposed the working memory model?", "Baddeley and Hitch", ["Atkinson and Shiffrin", "Ebbinghaus", "Pavlov"], "They proposed it in 1974."),
      q("In the working memory model, which part directs attention?", "The central executive", ["Sensory memory", "Long-term memory", "The forgetting curve"], "The central executive controls the other parts."),
      q("Who described the forgetting curve?", "Hermann Ebbinghaus", ["Baddeley", "Atkinson", "Shiffrin"], "Ebbinghaus tested himself on lists of nonsense syllables."),
      q("What does the forgetting curve show?", "We forget quickly at first, then more slowly", ["We never forget", "We forget slowly at first, then all at once", "Memory improves without practice"], "Most forgetting happens soon after learning."),
      q("What is spaced repetition?", "Reviewing material at increasing intervals", ["Cramming the night before", "Reading notes once", "Learning while asleep"], "Spacing reviews out fights the forgetting curve."),
      q("In the multi-store model, what is the correct order of stores?", "Sensory → short-term → long-term", ["Long-term → short-term → sensory", "Short-term → sensory → long-term", "Sensory → long-term → short-term"], "Information enters through the senses first."),
      q("What does 'duration' mean in memory research?", "How long information is held", ["How much can be held", "How information is coded", "How fast we recall"], "Capacity is how much; duration is how long."),
      q("You want to remember Spanish words for a test next month. Which method works best?", "Short reviews spread over several days", ["Reading them once tonight", "Cramming the night before only", "Never reviewing them"], "Spaced repetition improves long-term recall."),
    ],
  },
  {
    slug: "computer-science",
    title: "Searching and sorting",
    notes: {
      summary:
        "An algorithm is a step-by-step set of instructions. Linear search checks items one by one; binary search halves a sorted list each step. Bubble sort swaps neighbours; merge sort splits and merges. Big O describes how running time grows.",
      sections: [
        { heading: "Searching", points: ["Linear search checks each item in turn until it finds the target: O(n)", "Binary search repeatedly halves a sorted list: O(log n)", "Binary search only works on sorted data"] },
        { heading: "Sorting", points: ["Bubble sort repeatedly swaps adjacent items that are in the wrong order: O(n²)", "Merge sort splits a list into halves, sorts them and merges them: O(n log n)"] },
        { heading: "Efficiency", points: ["Big O notation describes how running time grows with input size", "For large lists, O(log n) and O(n log n) are much faster than O(n²)"] },
      ],
      keyTerms: [
        { term: "Algorithm", definition: "A step-by-step set of instructions for solving a problem" },
        { term: "Linear search", definition: "Checks each item one at a time until the target is found" },
        { term: "Binary search", definition: "Repeatedly halves a sorted list to find the target" },
        { term: "Bubble sort", definition: "Repeatedly swaps adjacent items that are in the wrong order" },
        { term: "Merge sort", definition: "Splits a list into halves, sorts them and merges them back together" },
        { term: "Big O notation", definition: "Describes how running time grows with input size" },
      ],
    },
    flashcards: [
      c("What is an algorithm?", "A step-by-step set of instructions for solving a problem"),
      c("How does linear search work?", "Checks each item one at a time"),
      c("How does binary search work?", "Repeatedly halves a sorted list"),
      c("What must be true of data for binary search?", "It must be sorted"),
      c("How does bubble sort work?", "Swaps adjacent items in the wrong order, repeatedly"),
      c("How does merge sort work?", "Splits into halves, sorts them, merges them back"),
      c("What does Big O notation describe?", "How running time grows with input size"),
      c("Time complexity of binary search?", "O(log n)"),
      c("Time complexity of merge sort?", "O(n log n)"),
      c("Time complexity of linear search?", "O(n)"),
      c("Time complexity of bubble sort?", "O(n²)"),
      c("At most how many checks does binary search need for 1,000 sorted items?", "About 10"),
    ],
    questions: [
      q("What is an algorithm?", "A step-by-step set of instructions for solving a problem", ["A type of computer chip", "A programming language", "A list of variables"], "Algorithms can be written in any language, or in plain English."),
      q("How does linear search find an item?", "Checks each item one at a time", ["Halves the list each step", "Sorts the list first", "Guesses randomly"], "It starts at the beginning and moves through in order."),
      q("What must be true of a list before you can use binary search?", "It must be sorted", ["It must have an even length", "It must contain numbers only", "It must be shorter than 100 items"], "Binary search relies on the order to discard half the list."),
      q("How does binary search work?", "Repeatedly halves a sorted list", ["Checks items from the start", "Swaps neighbouring items", "Splits and merges lists"], "It compares with the middle item and discards half each time."),
      q("What is the time complexity of binary search?", "O(log n)", ["O(n)", "O(n²)", "O(1)"], "Halving each step means the work grows very slowly."),
      q("What is the time complexity of linear search?", "O(n)", ["O(log n)", "O(n log n)", "O(1)"], "In the worst case it checks every item."),
      q("Which sorting algorithm repeatedly swaps adjacent items that are in the wrong order?", "Bubble sort", ["Merge sort", "Binary sort", "Linear sort"], "Large items 'bubble' to the end on each pass."),
      q("How does merge sort work?", "Splits a list into halves, sorts them and merges them", ["Swaps neighbouring items repeatedly", "Checks items one by one", "Picks random items"], "It's a divide-and-conquer algorithm."),
      q("What is the time complexity of merge sort?", "O(n log n)", ["O(n²)", "O(log n)", "O(n)"], "Splitting gives log n levels, and merging each level takes n steps."),
      q("What is the time complexity of bubble sort in the worst case?", "O(n²)", ["O(n log n)", "O(log n)", "O(1)"], "It can need about n passes of about n comparisons."),
      q("What does Big O notation describe?", "How running time grows with input size", ["The size of a program file", "How many lines of code there are", "The speed of the processor"], "It lets us compare algorithms independently of hardware."),
      q("About how many comparisons does binary search need at most for 1,000 sorted items?", "About 10", ["About 500", "About 1,000", "About 100"], "2¹⁰ = 1,024, so about 10 halvings are enough."),
      q("Which is faster for very large lists?", "Merge sort", ["Bubble sort", "They are always equal", "Neither can sort large lists"], "O(n log n) grows much more slowly than O(n²)."),
      q("You need to find a name in an unsorted list. Which search can you use straight away?", "Linear search", ["Binary search", "Merge search", "Bubble search"], "Binary search needs the list sorted first."),
      q("Which algorithm is described as 'divide and conquer'?", "Merge sort", ["Bubble sort", "Linear search", "None of these"], "It divides the problem into halves and combines the results."),
    ],
  },
];

const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
const BY_MATERIAL = new Map(SAMPLES.map((s) => [norm(s.material), s.slug]));

export const packBySlug = (slug: string | null | undefined) => PACKS.find((p) => p.slug === slug);

/** The library pack for this exact material (a sample, unedited), if there is one. */
export function packFor(material: string): LibraryPack | undefined {
  return packBySlug(BY_MATERIAL.get(norm(material)));
}

export const LIBRARY = PACKS;

const shuffled = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Turn library questions into quiz questions, options shuffled so the answer moves around. */
export function toQuestion(lq: LibraryQuestion): Question {
  const options = shuffled([lq.answer, ...lq.wrong]);
  return { prompt: lq.prompt, options, answerIndex: options.indexOf(lq.answer), explanation: lq.explanation };
}

/** Pick `count` questions from a pack, preferring ones not asked before (for rematches). */
export function quizFromPack(pack: LibraryPack, count: number, avoid: string[] = []): Question[] {
  const fresh = shuffled(pack.questions.filter((x) => !avoid.includes(x.prompt)));
  const seen = shuffled(pack.questions.filter((x) => avoid.includes(x.prompt)));
  return [...fresh, ...seen].slice(0, count).map(toQuestion);
}
