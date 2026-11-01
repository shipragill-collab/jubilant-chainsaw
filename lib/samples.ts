/** Ready-made study material, so new users can try everything in one click. */
export interface Sample {
  slug: string;
  subject: string;
  title: string;
  material: string;
}

export const SAMPLES: Sample[] = [
  {
    slug: "biology",
    subject: "Biology",
    title: "Photosynthesis",
    material: `# Photosynthesis
Photosynthesis happens in the chloroplasts of plant cells.
Chlorophyll is the green pigment that absorbs mostly red and blue light.
The light-dependent reactions take place in the thylakoid membranes and produce ATP and NADPH.
Water is split during the light-dependent reactions, releasing oxygen as a by-product.
The Calvin cycle runs in the stroma and fixes carbon dioxide into sugar.
The enzyme RuBisCO catalyses the first step of carbon fixation in the Calvin cycle.
C4 plants such as maize separate carbon fixation and the Calvin cycle into different cells.
CAM plants such as cacti open their stomata at night to reduce water loss.
Glucose made by photosynthesis can be stored as starch.`,
  },
  {
    slug: "chemistry",
    subject: "Chemistry",
    title: "Atoms and the periodic table",
    material: `# Atoms and the periodic table
An atom is made of a nucleus containing protons and neutrons, surrounded by electrons.
The atomic number is the number of protons in the nucleus.
Isotopes are atoms of the same element with different numbers of neutrons.
Elements in the same group of the periodic table have the same number of outer-shell electrons.
The noble gases in Group 0 are unreactive because they have full outer shells.
Alkali metals in Group 1 become more reactive further down the group.
An ionic bond forms when electrons are transferred from a metal to a non-metal.
A covalent bond is a shared pair of electrons between two non-metal atoms.
Dmitri Mendeleev arranged his periodic table in 1869 and left gaps for undiscovered elements.`,
  },
  {
    slug: "history",
    subject: "History",
    title: "The French Revolution",
    material: `# The French Revolution
The French Revolution began in 1789 with the storming of the Bastille.
Louis XVI was the king of France when the revolution started.
The Estates-General was summoned in 1789 to address a severe financial crisis.
The Declaration of the Rights of Man was adopted in August 1789.
Maximilien Robespierre led the Committee of Public Safety during the Reign of Terror.
The Reign of Terror saw thousands of people executed by guillotine.
The Jacobins were the most radical political club of the revolution.
Napoleon Bonaparte seized power in the coup of 18 Brumaire in 1799.`,
  },
  {
    slug: "physics",
    subject: "Physics",
    title: "Newton's laws of motion",
    material: `# Newton's laws of motion
Newton's first law states that an object stays at rest or moves at constant velocity unless a resultant force acts on it.
Inertia is the tendency of an object to resist changes to its motion.
Newton's second law states that force equals mass multiplied by acceleration.
Force is measured in newtons, mass in kilograms and acceleration in metres per second squared.
Newton's third law states that every action has an equal and opposite reaction.
Weight is the force of gravity acting on a mass, and on Earth it is about 9.8 newtons per kilogram.
Friction is a force that opposes motion between two surfaces in contact.
Momentum is mass multiplied by velocity and is conserved in collisions.`,
  },
  {
    slug: "geography",
    subject: "Geography",
    title: "Plate tectonics",
    material: `# Plate tectonics
The Earth's crust is broken into large pieces called tectonic plates.
Convection currents in the mantle are thought to move the plates.
At constructive plate boundaries the plates move apart and new crust is formed.
At destructive plate boundaries an oceanic plate sinks beneath a continental plate in a process called subduction.
Conservative plate boundaries occur where plates slide past each other, such as the San Andreas Fault.
Most earthquakes and volcanoes are found along plate boundaries.
The Richter scale measures the magnitude of an earthquake.
Alfred Wegener proposed the theory of continental drift in 1912.`,
  },
  {
    slug: "economics",
    subject: "Economics",
    title: "Supply and demand",
    material: `# Supply and demand
Demand is the quantity of a good that consumers are willing and able to buy at each price.
The law of demand states that as price rises, quantity demanded falls.
Supply is the quantity of a good that producers are willing and able to sell at each price.
Equilibrium price is where quantity demanded equals quantity supplied.
A surplus occurs when the price is above equilibrium, so supply exceeds demand.
A shortage occurs when the price is below equilibrium, so demand exceeds supply.
Price elasticity of demand measures how responsive demand is to a change in price.
Substitutes are goods that can replace each other, such as tea and coffee.`,
  },
  {
    slug: "psychology",
    subject: "Psychology",
    title: "How memory works",
    material: `# How memory works
The multi-store model of memory was proposed by Atkinson and Shiffrin in 1968.
Sensory memory holds information from the senses for less than a second.
Short-term memory has a limited capacity of about seven items and lasts around 18 to 30 seconds.
Rehearsal transfers information from short-term memory to long-term memory.
Long-term memory has a potentially unlimited capacity and duration.
The working memory model was proposed by Baddeley and Hitch in 1974.
The forgetting curve was described by Hermann Ebbinghaus.
Spaced repetition improves long-term recall by reviewing material at increasing intervals.`,
  },
  {
    slug: "computer-science",
    subject: "Computer Science",
    title: "Searching and sorting",
    material: `# Searching and sorting
An algorithm is a step-by-step set of instructions for solving a problem.
Linear search checks each item in a list one at a time until it finds the target.
Binary search repeatedly halves a sorted list and only works on sorted data.
Bubble sort repeatedly swaps adjacent items that are in the wrong order.
Merge sort splits a list into halves, sorts them and merges them back together.
Big O notation describes how the running time of an algorithm grows with the input size.
Binary search has a time complexity of O(log n).
Merge sort has a time complexity of O(n log n).`,
  },
];

export const sampleBySlug = (slug: string | null) => SAMPLES.find((s) => s.slug === slug);
