import { Chapter } from '../types/story';

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    romanNumeral: 'I',
    title: 'The Stellar Forge',
    leftPageTitle: 'GENESIS OF THE PILLARS',
    leftPageSubtitle: 'Sector M16 · Eagle Cloud Nursery',
    leftPageText: [
      'Deep within the interstellar nursery, molecular clouds of cold molecular hydrogen collapse under their own primordial weight. Stellar winds sculpt towering columns light-years tall.',
      'Here, proto-stellar accretion disks ignite with thermonuclear fury, birthing sibling suns destined to seed heavy elements across the galactic spiral arm.',
      'Hover over the stellar core on the facing page to observe thermal convection, or click the storyline module to project the full archival records.'
    ],
    leftPageNote: 'Archival Reference: Astrocronicon Codex Vol. IV, §12.8',
    rightPageIllustration: 'nebula',
    rightPageTitle: 'The Stellar Forge Core',
    storyline: {
      id: 'story-stellar-forge',
      title: 'THE STELLAR FORGE: GENESIS OF THE PILLARS',
      subtitle: 'Chronicles of Starbirth & Galactic Nucleosynthesis',
      epoch: 'Cycle 3.84 · Galactic Year 228',
      summary: 'An expedition into the heart of the Eagle Molecular Core reveals the violent, beautiful mechanics of star formation that gave rise to all known matter.',
      fullNarrative: [
        'Before the first planets solidified, before the first oceans condensed, the galaxy was a cold expanse of hydrogen gas and silence. In the stellar nurseries, gravity began its patient, inexorable harvest.',
        'As density reached critical thresholds, temperatures climbed from near absolute zero to millions of Kelvins. In the center of the condensing Bok globule, hydrogen nuclei overcame electromagnetic repulsion to fuse into helium, releasing photons that would take hundreds of millennia to fight their way to the surface.',
        'The young stars flared with fierce ultraviolet radiation, eroding their parent gas clouds into the monumental towers known as the Pillars of Creation. In this crucible, heavy elements were forged: the iron in our blood, the silicon in our machines, the carbon in our bones.',
        'To look upon the stellar forge is not merely to study astrophysics—it is to witness the origin of consciousness itself, carved into glowing nebulous dust.'
      ],
      telemetry: {
        coordinates: 'RA 18h 18m 48s | Dec -13° 49′',
        stellarClass: 'O-Type Hypergiant & Proto-Star Cluster',
        temperature: '38,500 K (Core Ionization)',
        distanceLightYears: '7,000 ly from Sol',
        phenomenon: 'Gravitational Collapse & Photoevaporation'
      },
      archivalQuote: {
        text: 'The cosmos is within us. We are made of star-stuff. We are a way for the cosmos to know itself.',
        author: 'Voyager Heritage Inscription'
      },
      interactivePrompt: 'Move cursor over the core to induce magnetic flare currents. Click to discharge ionization pulse.',
      accentColor: '#38bdf8'
    }
  },
  {
    id: 2,
    romanNumeral: 'II',
    title: 'The Event Horizon',
    leftPageTitle: 'THE SINGULARITY EYE',
    leftPageSubtitle: 'Cygnus X-1 · Kerr Metric Distortion',
    leftPageText: [
      'Where a supermassive star exhausted its fuel, space-time curved so sharply that neither light nor matter could escape. Around the Schwarzschild radius, time itself dilates toward infinity.',
      'Plasma spirals through the accretion disk at relativistic velocities, generating magnetic dynamos that launch twin relativistic jets across the void.',
      'Observe the gravitational lensing of distant background stars as the singularity consumes surrounding stellar matter.'
    ],
    leftPageNote: 'Warning: Exceeding ISCO (Innermost Stable Circular Orbit) results in irreversible descent.',
    rightPageIllustration: 'blackhole',
    rightPageTitle: 'Kerr Singularity Accretion',
    storyline: {
      id: 'story-event-horizon',
      title: 'THE SINGULARITY EYE: VOYAGE TO THE EVENT HORIZON',
      subtitle: 'General Relativity at the Boundary of Physics',
      epoch: 'Epoch of Infinite Dilation',
      summary: 'A deep telemetry probe records the final milliseconds before crossing the photon sphere, witnessing the warping of spacetime and the edge of reality.',
      fullNarrative: [
        'As the unmanned surveyor probe Apex-9 slipped inside the 1.5-Schwarzschild radius, the entire celestial sphere transformed. The gravitational lens warped the starry backdrop into Einstein rings, bending rays from behind the black hole directly toward the forward cameras.',
        'Time dilation became visceral. To outside observers stationed at safe orbital distance, the probe appeared to decelerate, its signal redshifting into deep radio frequencies, freezing perpetually on the horizon like a ghost caught in amber.',
        'Yet from the probe’s own inertial reference frame, time ticked forward with terrifying normalcy. Passing the photon sphere, light orbits the singularity in closed loops—an observer looking outward would see the back of their own vessel reflected in the curve of warped space.',
        'At the event horizon itself, the spatial coordinate and time coordinate swap mathematical signs. Forward motion in space becomes indistinguishable from moving inexorably forward in time toward the central singularity.'
      ],
      telemetry: {
        coordinates: 'RA 19h 58m 21s | Dec +35° 12′ 05″',
        stellarClass: 'Kerr Rotating Black Hole (14.8 M☉)',
        temperature: '1.2 × 10⁻⁸ K (Hawking Radiation)',
        distanceLightYears: '6,100 ly from Sol',
        phenomenon: 'Frame Dragging & Gravitational Lensing'
      },
      archivalQuote: {
        text: 'Space and time are not conditions in which we live, but modes by which we think. Here, the modes collapse.',
        author: 'Relativity Inscription Codex'
      },
      interactivePrompt: 'Tilt cursor to warp the accretion disc tilt. Click to perturb the photon ring.',
      accentColor: '#f59e0b'
    }
  },
  {
    id: 3,
    romanNumeral: 'III',
    title: 'The Pulsar Lighthouse',
    leftPageTitle: 'PULSAR BEACONS OF ORION',
    leftPageSubtitle: 'Crab Nebula · PSR B0531+21 Core',
    leftPageText: [
      'A city-sized sphere with the mass of two suns, spun up to thirty rotations per second by conservation of angular momentum. A trillion gauss magnetic field channels relentless radiation.',
      'Cosmic navigators across millennia have calibrated interstellar chronometers against these eternal metronomes, using pulse timing arrays to detect the whisper of gravitational waves.',
      'The rhythmic beam sweeps the cosmos like a lighthouse across an ocean of infinite dark.'
    ],
    leftPageNote: 'Pulse Frequency: 30.2 Hz · Timing Precision: 10⁻¹⁵ seconds',
    rightPageIllustration: 'pulsar',
    rightPageTitle: 'Relativistic Magnetic Dynamo',
    storyline: {
      id: 'story-pulsar-beacon',
      title: 'THE PULSAR BEACON: THE LOST SIGNAL OF ORION',
      subtitle: 'Interstellar Geodesy & The Quantum Core',
      epoch: 'Crab Supernova +1,054 Years',
      summary: 'Decoding an ancient anomalous pulse pattern embedded within the radio strobe of PSR B0531+21, pointing toward an forgotten transmission array.',
      fullNarrative: [
        'Neutron stars represent matter pushed to the absolute edge of stability before total gravitational collapse. Within a radius of barely ten kilometers, atomic nuclei are squeezed into superfluid neutron degeneracy—a single teaspoon of pulsar crust would weigh billions of tons.',
        'At each magnetic pole, relativistic electron cascades stream outward along curved field lines, emitting synchrotron radiation focused into razor-sharp collimated beams. Because the magnetic and rotational axes do not align, the beam sweeps across the sky with unmatched regularity.',
        'During the Deep Space Survey of cycle 92, an artificial frequency modulation was detected nestled between the 30.2 Hz pulses. It was not stellar noise: it was a synthetic beacon, transmitting coordinates to a dormant navigational buoy moored in the Orion Rift.',
        'These pulsars are the lighthouses of deep space, eternal monuments that outlast planets, empires, and suns.'
      ],
      telemetry: {
        coordinates: 'RA 05h 34m 32s | Dec +22° 00′ 52″',
        stellarClass: 'Neutron Star / Pulsar (1.4 M☉)',
        temperature: '1.6 × 10⁶ K Surface',
        distanceLightYears: '6,500 ly from Sol',
        phenomenon: 'Synchrotron Beams & Magnetosphere'
      },
      archivalQuote: {
        text: 'In the vast ocean of nothingness, the pulsar pulses like a steady heartbeat, telling wanderers where they are.',
        author: 'Galactic Navigators Guild'
      },
      interactivePrompt: 'Move cursor to reorient the magnetic poles. Click to initiate pulse synchronization sweep.',
      accentColor: '#a855f7'
    }
  },
  {
    id: 4,
    romanNumeral: 'IV',
    title: 'The Dyson Sphere',
    leftPageTitle: 'THE TYPE-II ARCHITECTS',
    leftPageSubtitle: 'Tabby Star System · KIC 8462852',
    leftPageText: [
      'A swarm of tens of thousands of orbital collector habitats, solar sails, and power mirrors encircling an F-type main sequence star, harvesting 100% of its radiant energy output.',
      'Conceived as the pinnacle of Type-II civilization engineering, the megastructure provides boundless energy to drive interstellar propulsion arrays and computational planetary minds.',
      'Explore the orbital rings and collector nodes on the facing page, or open the blueprint archive for architectural specifications.'
    ],
    leftPageNote: 'Estimated Energy Output: 3.828 × 10²⁶ Watts · Kardashev Scale II',
    rightPageIllustration: 'dysonsphere',
    rightPageTitle: 'Dyson Swarm Orbital Array',
    storyline: {
      id: 'story-dyson-sphere',
      title: 'THE DYSON MEGASTRUCTURE: ARCHITECT OF TYPE-II ETERNITY',
      subtitle: 'Stellar Engineering & Planetary Transcendence',
      epoch: 'Post-Scarcity Stellar Era',
      summary: 'Blueprints, telemetry, and philosophy behind the construction of a stellar containment swarm capable of powering a civilization for trillions of years.',
      fullNarrative: [
        'A planet is a cradle, but a species cannot remain in the cradle forever. When a civilization’s energy appetite exceeds the solar insolation hitting a single planetary disk, it faces a fundamental thermodynamic choice: stagnate, or capture the star.',
        'The Dyson Swarm does not encase the sun in a fragile rigid shell. Instead, it deploys a non-coplanar web of millions of ultra-light statites and collector mirrors orbiting at 0.8 AU, each positioned to harness radiant flux and beam microwave power to deep space relay stations.',
        'With 10²⁶ Watts of harnessable energy, computational matrices the size of moons run planetary climate simulations, terraforming engines alter distant worlds, and relativistic starships accelerate to noticeable fractions of the speed of light.',
        'To look upon a Dyson array is to see technology elevated to the scale of nature, where intelligent design reshapes the sky itself.'
      ],
      telemetry: {
        coordinates: 'RA 20h 06m 15s | Dec +44° 27′ 25″',
        stellarClass: 'F3 V Main Sequence + Megastructure Swarm',
        temperature: '6,750 K Star Surface',
        distanceLightYears: '1,470 ly from Sol',
        phenomenon: 'Irregular Stellar Dimming & IR Excess'
      },
      archivalQuote: {
        text: 'The future of life belongs not to those who dwell under a star, but to those who wrap their hands gently around it.',
        author: 'Megastructure Engineering Treatise'
      },
      interactivePrompt: 'Rotate cursor to align the orbital collector planes. Click to fire energy transfer grid.',
      accentColor: '#10b981'
    }
  }
];
