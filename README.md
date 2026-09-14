# Portfolio minor Circulaire Economie

Dit is het sjabloon voor je portfolio in de minor Circulaire Economie. Je maakt er je eigen kopie van, en GitHub zet die om in een website waarop je leerdoelen, je projecten met een tijdlijn van het proces en je wekelijkse voortgang te zien zijn. Je vult alles in via formulieren op de site zelf; je hoeft geen code aan te raken en niets te installeren.

Het sjabloon begint leeg. Wil je eerst zien hoe een ingevuld portfolio eruitziet, klik dan op de startpagina op **Bekijk een ingevuld voorbeeld**: dat laadt het portfolio van een fictieve student als concept, dat je daarna weer weggooit.

## Je eigen portfolio maken

Klik bovenaan deze pagina op **Use this template** en kies **Create a new repository**. Noem de repository `portfolio-minor-ce` en houd hem op **Public**; GitHub Pages werkt op een gratis account alleen bij een openbare repository. Wil je de bron toch privé houden, vraag dan eerst het [GitHub Student Developer Pack](https://education.github.com/pack) aan.

Ga daarna in je nieuwe repository naar **Settings**, klik links op **Pages**, kies bij Source voor **Deploy from a branch**, branch `main`, map `/ (root)`, en klik op Save. Na een paar minuten staat je site op `https://jouwgebruikersnaam.github.io/portfolio-minor-ce/`. Het adres staat op dezelfde instellingenpagina.

## Invullen en publiceren

Open je site en klik in het menu op **Invullen**. Daar staan vier onderdelen: je profiel, je leerdoelen, je projecten en je logboek. Alles wat je daar typt zie je meteen terug op de rest van de site, als concept. Dat concept staat alleen in jouw browser; anderen zien nog de oude versie.

Ben je tevreden, ga dan naar **Publiceren** en klik op **Kopieer en open GitHub**. Je hele portfolio wordt gekopieerd en GitHub opent het databestand in een nieuw tabblad. Klik in de editor, selecteer alles (Ctrl+A), plak (Ctrl+V) en klik op **Commit changes**. Na een minuut staat de nieuwe versie online en verdwijnt het concept vanzelf.

Werk je op twee apparaten, publiceer dan steeds voordat je op het andere apparaat verdergaat. De site waarschuwt als er online al een nieuwere versie staat dan waar je concept op is gebaseerd.

## Wat je invult

Bij **Profiel** staan je naam, opleiding, cohort en een korte tekst over jou en je opdracht.

Bij **Leerdoelen** heeft elk leerdoel een titel, een status (gepland, bezig of behaald), een voortgang in procenten, een streefdatum, een beschrijving, een reflectie en bewijsstukken. Schuif de voortgang bij als je een stap hebt gezet en werk dan ook de reflectie bij. Zet een leerdoel pas op behaald als er een reflectie staat; hulpmiddel 7 (Reflectie) uit de studentenhandleiding helpt daarbij.

Bij **Projecten** heeft elk project een opdrachtgever, een start- en einddatum en een lijst met momenten: gesprekken, mijlpalen, tussenpresentaties, opleveringen. Elk moment krijgt een datum en het focusgebied waarin je toen zat (Discover, Define, Develop of Deliver). De site tekent daar een tijdlijn van, met de punten in de kleur van het focusgebied. Momenten in de toekomst staan er als gepland op, dus je kunt de tijdlijn ook als planning gebruiken. Je logboekberichten bij het project komen er vanzelf bij.

Bij **Logboek** schrijf je elke week een bericht: wat je hebt gedaan, wat je hebt geleerd en wat je volgende stap is. Je koppelt het aan een project en aan de leerdoelen die het raakt. Het bericht verschijnt dan bij die leerdoelen en op de tijdlijn van het project.

Het focusgebied is een label voor waar je aandacht zat, geen fase die je afvinkt. Je kunt in week 8 gewoon weer in Discover zitten omdat een gesprek met de opdrachtgever alles op zijn kop zette; schrijf dat dan op, want dat is precies het soort inzicht waar het logboek voor bedoeld is.

## Foto's en documenten als bewijs

Bestanden zet je in de map `bewijs` van je repository: open die map op GitHub, klik op **Add file** en dan **Upload files**. Daarna link je het bestand bij een leerdoel als `bewijs/bestandsnaam.jpg`. Zet er geen namen, adressen of contactgegevens van bewoners, klanten of medewerkers in, en geen documenten die je opdrachtgever vertrouwelijk heeft gedeeld. Verwijs in zo'n geval naar het document zonder link, zoals in het voorbeeld bij leerdoel 2. Twijfel je, vraag het je opdrachtgever.

## Voor wie meer wil weten

Alle inhoud staat in één bestand, `data/portfolio.json`. De formulieren schrijven dat bestand voor je; wie wil, kan het ook rechtstreeks op GitHub bewerken. Het voorbeeld staat in `data/voorbeeld.json` en de map `voorbeeld`; die mag je verwijderen als je ze niet meer nodig hebt. De site zelf bestaat uit `index.html`, de stylesheet in `assets/css` en drie scripts in `assets/js`. Meer over hoe GitHub en GitHub Pages werken lees je in hulpmiddel 15 (AI naar website) in de [studentenhandleiding](https://fabianb88.github.io/minor-ce-studentenhandleiding/).

De map `_jekyll-versie` bevat een eerdere opzet van dit sjabloon en wordt niet gebruikt.
