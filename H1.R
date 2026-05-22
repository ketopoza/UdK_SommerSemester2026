library(tidyverse)

# ── Country lists by continent ─────────────────────────────────────────────────
european_countries <- c(
  "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina",
  "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia",
  "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland",
  "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg",
  "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia",
  "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia",
  "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine",
  "United Kingdom", "Vatican City"
)

asian_countries <- c(
  "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan",
  "Brunei", "Cambodia", "China", "Cyprus", "Georgia", "India", "Indonesia",
  "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait",
  "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia",
  "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine",
  "Philippines", "Qatar", "Saudi Arabia", "Singapore", "South Korea",
  "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste",
  "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam",
  "Yemen"
)

american_countries <- c(
  "Antigua and Barbuda", "Argentina", "Bahamas", "Barbados", "Belize",
  "Bolivia", "Brazil", "Canada", "Chile", "Colombia", "Costa Rica", "Cuba",
  "Dominica", "Dominican Republic", "Ecuador", "El Salvador", "Grenada",
  "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua",
  "Panama", "Paraguay", "Peru", "Puerto Rico", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Suriname",
  "Trinidad and Tobago", "United States of America", "Uruguay", "Venezuela"
)

african_countries <- c(
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros",
  "Democratic Republic of the Congo", "Republic of the Congo", "Djibouti",
  "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon",
  "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya",
  "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali",
  "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger",
  "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles",
  "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan",
  "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
)

oceanian_countries <- c(
  "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia",
  "Nauru", "New Zealand", "Palau", "Papua New Guinea", "Samoa",
  "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu"
)

# ── Tag each country with its continent ───────────────────────────────────────
continent_map <- bind_rows(
  tibble(country_name = european_countries,  continent = "Europe"),
  tibble(country_name = asian_countries,     continent = "Asia"),
  tibble(country_name = american_countries,  continent = "America"),
  tibble(country_name = african_countries,   continent = "Africa"),
  tibble(country_name = oceanian_countries,  continent = "Oceania")
)

# ── Load, filter and fill gaps ─────────────────────────────────────────────────
ert <- read_csv("data/ert.csv")

all_continents <- ert %>%
  inner_join(continent_map, by = "country_name") %>%
  select(continent, country_name, year, v2x_polyarchy) %>%
  drop_na(v2x_polyarchy) %>%
  arrange(continent, country_name, year) %>%
  group_by(continent, country_name) %>%
  complete(year = seq(min(year), max(year), by = 1)) %>%
  ungroup()

# ── Plot ───────────────────────────────────────────────────────────────────────
library(tidyverse)

# ── Plot function ──────────────────────────────────────────────────────────────
plot_continent <- function(data, continent_name, color = "#c0392b") {
  
  data %>%
    filter(continent == continent_name) %>%
    ggplot(aes(x = year, y = v2x_polyarchy)) +
    geom_line(
      aes(group = country_name),
      color     = "grey60",
      alpha     = 0.4,
      linewidth = 0.35
    ) +
    geom_smooth(
      method    = "loess",
      span      = 0.3,
      se        = TRUE,
      color     = color,
      fill      = color,
      alpha     = 0.15,
      linewidth = 1.4
    ) +
    scale_x_continuous(breaks = seq(1900, 2025, by = 20)) +
    scale_y_continuous(
      limits = c(0, 1),
      breaks = seq(0, 1, by = 0.2),
      labels = scales::number_format(accuracy = 0.1)
    ) +
    labs(
      title    = paste("Electoral Democracy Index —", continent_name),
      subtitle = "Grey lines = individual countries · Trend line = LOESS · Gaps = missing data",
      x        = "Year",
      y        = "Electoral Democracy Index (v2x_polyarchy)"
    ) +
    theme_minimal(base_size = 13) +
    theme(
      plot.title       = element_text(face = "bold", size = 15),
      plot.subtitle    = element_text(color = "grey40", size = 10),
      panel.grid.minor = element_blank(),
      panel.grid.major = element_line(color = "grey92"),
      axis.text.x      = element_text(angle = 45, hjust = 1),
      axis.text        = element_text(color = "grey30")
    )
}

# ── Generate one plot per continent ───────────────────────────────────────────
plot_europe   <- plot_continent(all_continents, "Europe",  color = "#2166ac")
plot_asia     <- plot_continent(all_continents, "Asia",    color = "#d6604d")
plot_america  <- plot_continent(all_continents, "America", color = "#1a9850")
plot_africa   <- plot_continent(all_continents, "Africa",  color = "#f4a582")
plot_oceania  <- plot_continent(all_continents, "Oceania", color = "#9970ab")

# ── Print them ─────────────────────────────────────────────────────────────────
plot_europe
plot_asia
plot_america
plot_africa
plot_oceania

# --- Save ---
ggsave("europe.png")
ggsave("asia.png")
ggsave("america.png")
ggsave("africa.png")
ggsave("oceania.png")
