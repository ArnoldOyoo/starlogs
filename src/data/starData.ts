// Bright stars with their right ascension (hours), declination (degrees), and magnitude
export interface Star {
  name: string;
  ra: number; // Right ascension in hours
  dec: number; // Declination in degrees
  magnitude: number;
  constellation: string;
}

export const brightStars: Star[] = [
  // Major navigational and bright stars
  { name: "Sirius", ra: 6.752, dec: -16.716, magnitude: -1.46, constellation: "Canis Major" },
  { name: "Canopus", ra: 6.399, dec: -52.696, magnitude: -0.74, constellation: "Carina" },
  { name: "Arcturus", ra: 14.261, dec: 19.182, magnitude: -0.05, constellation: "Boötes" },
  { name: "Vega", ra: 18.616, dec: 38.784, magnitude: 0.03, constellation: "Lyra" },
  { name: "Capella", ra: 5.278, dec: 45.998, magnitude: 0.08, constellation: "Auriga" },
  { name: "Rigel", ra: 5.242, dec: -8.202, magnitude: 0.13, constellation: "Orion" },
  { name: "Procyon", ra: 7.655, dec: 5.225, magnitude: 0.34, constellation: "Canis Minor" },
  { name: "Betelgeuse", ra: 5.919, dec: 7.407, magnitude: 0.42, constellation: "Orion" },
  { name: "Altair", ra: 19.846, dec: 8.868, magnitude: 0.76, constellation: "Aquila" },
  { name: "Aldebaran", ra: 4.599, dec: 16.509, magnitude: 0.85, constellation: "Taurus" },
  { name: "Antares", ra: 16.490, dec: -26.432, magnitude: 0.96, constellation: "Scorpius" },
  { name: "Spica", ra: 13.420, dec: -11.161, magnitude: 1.04, constellation: "Virgo" },
  { name: "Pollux", ra: 7.755, dec: 28.026, magnitude: 1.14, constellation: "Gemini" },
  { name: "Fomalhaut", ra: 22.960, dec: -29.622, magnitude: 1.16, constellation: "Piscis Austrinus" },
  { name: "Deneb", ra: 20.690, dec: 45.280, magnitude: 1.25, constellation: "Cygnus" },
  { name: "Regulus", ra: 10.139, dec: 11.967, magnitude: 1.35, constellation: "Leo" },
  { name: "Castor", ra: 7.577, dec: 31.888, magnitude: 1.58, constellation: "Gemini" },
  { name: "Polaris", ra: 2.530, dec: 89.264, magnitude: 1.98, constellation: "Ursa Minor" },
  
  // Orion constellation stars
  { name: "Bellatrix", ra: 5.419, dec: 6.350, magnitude: 1.64, constellation: "Orion" },
  { name: "Alnilam", ra: 5.603, dec: -1.202, magnitude: 1.69, constellation: "Orion" },
  { name: "Alnitak", ra: 5.679, dec: -1.943, magnitude: 1.77, constellation: "Orion" },
  { name: "Mintaka", ra: 5.533, dec: -0.299, magnitude: 2.23, constellation: "Orion" },
  { name: "Saiph", ra: 5.796, dec: -9.670, magnitude: 2.09, constellation: "Orion" },
  
  // Big Dipper / Ursa Major
  { name: "Dubhe", ra: 11.062, dec: 61.751, magnitude: 1.79, constellation: "Ursa Major" },
  { name: "Merak", ra: 11.031, dec: 56.382, magnitude: 2.37, constellation: "Ursa Major" },
  { name: "Phecda", ra: 11.897, dec: 53.695, magnitude: 2.44, constellation: "Ursa Major" },
  { name: "Megrez", ra: 12.257, dec: 57.033, magnitude: 3.31, constellation: "Ursa Major" },
  { name: "Alioth", ra: 12.900, dec: 55.960, magnitude: 1.77, constellation: "Ursa Major" },
  { name: "Mizar", ra: 13.399, dec: 54.925, magnitude: 2.27, constellation: "Ursa Major" },
  { name: "Alkaid", ra: 13.792, dec: 49.313, magnitude: 1.86, constellation: "Ursa Major" },
  
  // Cassiopeia
  { name: "Schedar", ra: 0.675, dec: 56.537, magnitude: 2.23, constellation: "Cassiopeia" },
  { name: "Caph", ra: 0.153, dec: 59.150, magnitude: 2.27, constellation: "Cassiopeia" },
  { name: "Gamma Cas", ra: 0.945, dec: 60.717, magnitude: 2.47, constellation: "Cassiopeia" },
  { name: "Ruchbah", ra: 1.430, dec: 60.235, magnitude: 2.68, constellation: "Cassiopeia" },
  { name: "Segin", ra: 1.907, dec: 63.670, magnitude: 3.38, constellation: "Cassiopeia" },
  
  // Additional bright stars
  { name: "Mimosa", ra: 12.795, dec: -59.689, magnitude: 1.25, constellation: "Crux" },
  { name: "Acrux", ra: 12.443, dec: -63.099, magnitude: 0.76, constellation: "Crux" },
  { name: "Hadar", ra: 14.064, dec: -60.373, magnitude: 0.61, constellation: "Centaurus" },
  { name: "Rigil Kent", ra: 14.660, dec: -60.835, magnitude: -0.01, constellation: "Centaurus" },
  { name: "Shaula", ra: 17.560, dec: -37.104, magnitude: 1.62, constellation: "Scorpius" },
  { name: "Eltanin", ra: 17.943, dec: 51.489, magnitude: 2.23, constellation: "Draco" },
];

// Constellation line data: pairs of star names to connect
export interface ConstellationLines {
  name: string;
  lines: [string, string][];
}

export const constellationLines: ConstellationLines[] = [
  {
    name: "Orion",
    lines: [
      ["Betelgeuse", "Bellatrix"],
      ["Betelgeuse", "Alnilam"],
      ["Bellatrix", "Mintaka"],
      ["Alnilam", "Alnitak"],
      ["Alnilam", "Mintaka"],
      ["Alnitak", "Saiph"],
      ["Mintaka", "Rigel"],
      ["Saiph", "Rigel"],
    ],
  },
  {
    name: "Ursa Major",
    lines: [
      ["Dubhe", "Merak"],
      ["Merak", "Phecda"],
      ["Phecda", "Megrez"],
      ["Megrez", "Dubhe"],
      ["Megrez", "Alioth"],
      ["Alioth", "Mizar"],
      ["Mizar", "Alkaid"],
    ],
  },
  {
    name: "Cassiopeia",
    lines: [
      ["Caph", "Schedar"],
      ["Schedar", "Gamma Cas"],
      ["Gamma Cas", "Ruchbah"],
      ["Ruchbah", "Segin"],
    ],
  },
  {
    name: "Summer Triangle",
    lines: [
      ["Vega", "Deneb"],
      ["Deneb", "Altair"],
      ["Altair", "Vega"],
    ],
  },
];
