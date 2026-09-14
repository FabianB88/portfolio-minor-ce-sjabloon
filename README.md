# Portfolio minor Circulaire Economie

Dit is het sjabloon voor je portfolio in de minor Circulaire Economie. Je maakt er je eigen kopie van, en GitHub zet die automatisch om in een website waarop je leerdoelen, projecten en wekelijkse voortgang te zien zijn. Je hoeft niets te installeren: alles kan in de browser.

Het sjabloon is gevuld met een fictieve student, Noor Jansen, en een fictieve opdrachtgever. Haar leerdoelen, project en logboekberichten laten zien wat de bedoeling is. Je vervangt ze door je eigen inhoud.

## Je eigen portfolio maken

Klik bovenaan deze pagina op **Use this template** en kies **Create a new repository**. Noem de repository `portfolio-minor-ce` en houd hem op **Public**; GitHub Pages werkt op een gratis account alleen bij een openbare repository. Wil je de bron toch privé houden, vraag dan eerst het [GitHub Student Developer Pack](https://education.github.com/pack) aan.

Ga daarna in je nieuwe repository naar **Settings**, klik links op **Pages**, kies bij Source voor **Deploy from a branch**, branch `main`, map `/ (root)`, en klik op Save. Na een paar minuten staat je site op `https://jouwgebruikersnaam.github.io/portfolio-minor-ce/`. Het adres staat op dezelfde instellingenpagina.

## De drie handelingen die je nodig hebt

Alles in dit portfolio is een tekstbestand. Om er iets in te veranderen open je het bestand op github.com, klik je rechtsboven op het potloodje, pas je de tekst aan en klik je op **Commit changes**. Een nieuw bestand maak je met **Add file** en dan **Create new file**. Een foto of pdf zet je erbij met **Add file** en dan **Upload files**. Dat is alles. Binnen een minuut staat de wijziging op je site.

Wil je meer weten over hoe GitHub en GitHub Pages werken, lees dan hulpmiddel 15 (AI naar website) in de [studentenhandleiding](https://fabianb88.github.io/minor-ce-studentenhandleiding/).

## Wat waar staat

Je eigen naam, opleiding en cohort staan bovenaan in `_config.yml`. Dat is het enige instellingenbestand dat je aanpast.

De tekst op de startpagina staat in `index.md`: wie je bent, wat je opdracht is. Het voortgangsoverzicht eronder maakt de site zelf.

Elk leerdoel is een bestand in de map `_leerdoelen`. Elk project is een bestand in `_projecten`. Elk logboekbericht is een bestand in `_posts`. Foto's, schetsen en documenten die je als bewijs wilt laten zien zet je in de map `bewijs`.

## Een leerdoel toevoegen of bijwerken

Open een bestaand leerdoel in `_leerdoelen` en bekijk de regels bovenaan tussen de streepjes. Daar staan vier dingen die de site gebruikt: de titel, het nummer, de status en de streefdatum. Daaronder kun je bewijsstukken opsommen, elk met een korte tekst en eventueel een link.

De status is `gepland`, `bezig` of `behaald`. Verander je die, dan verandert het overzicht op de startpagina mee. Zet een leerdoel pas op behaald als je er ook een reflectie bij hebt geschreven; hulpmiddel 7 (Reflectie) uit de studentenhandleiding helpt daarbij.

Een nieuw leerdoel maak je door een bestaand leerdoelbestand te kopiëren naar een nieuwe naam, bijvoorbeeld `04-mijn-leerdoel.md`, en het nummer bovenin op 4 te zetten. De nummers gebruik je om vanuit het logboek naar leerdoelen te verwijzen.

## Een logboekbericht schrijven

Maak in `_posts` een nieuw bestand met de datum vooraan in de naam: `2026-09-18-week-4.md`. Kopieer de kopregels van een bestaand bericht en vul in welk focusgebied je vooral in zat (Discover, Define, Develop of Deliver), bij welk project het hoort en welke leerdoelen het raakt, bijvoorbeeld `leerdoelen: [1, 3]`. Het bericht verschijnt dan vanzelf bij die leerdoelen en bij dat project.

Het focusgebied is een label voor waar je aandacht zat, geen fase die je afvinkt. Je kunt in week 8 gewoon weer in Discover zitten omdat een gesprek met de opdrachtgever alles op zijn kop zette; schrijf dat dan op, want dat is precies het soort inzicht waar het logboek voor bedoeld is.

## Wat niet op de site hoort

Je site is openbaar. Zet er geen namen, adressen of contactgegevens van bewoners, klanten of medewerkers op, en geen documenten die je opdrachtgever vertrouwelijk heeft gedeeld. Verwijs in zo'n geval naar het document zonder het te plaatsen, zoals in het voorbeeld bij leerdoel 2. Twijfel je, vraag het je opdrachtgever.
