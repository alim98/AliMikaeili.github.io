/* GRAMMAR LISTS the trainers rely on. Add to them when a lesson brings new words.

     G_SING    plural noun → its singular (der · die · das trainer explains plurals with it)
     G_PLURAL  nouns in the vocabulary that are plurals (always "die")
     VIRR      verbs with fully irregular present tense: [ich, du, er/sie/es, wir, ihr, sie/Sie]
     PLURALS   singular → plural for the 👥 Plural trainer (at the end of this file)
     VCHG      stem-changing verbs: infinitive → changed stem used for du and er/sie/es
               (sprechen → sprich → du sprichst, er spricht)
*/
const G_SING={Studenten:'Student',Studentinnen:'Studentin',Fotos:'Foto',Kinder:'Kind',Bücher:'Buch',Filme:'Film',Partys:'Party',Sprachen:'Sprache',Tipps:'Tipp',Fragen:'Frage',Erstsemester:'Erstsemester',Freunde:'Freund',Lehrerinnen:'Lehrerin',Kollegen:'Kollege',Personen:'Person',Sätze:'Satz',Stichwörter:'Stichwort',Notizen:'Notiz',Gespräche:'Gespräch'};
const G_PLURAL=new Set(['die Studenten','die Studentinnen','die Fotos','die Kinder','die Bücher','die Filme','die Freizeitaktivitäten','die Partys','die Sprachen','die Tipps','die Fragen','die Erstsemester','die Freunde','die Lehrerinnen','die Kollegen','die Personen','die Studierenden','die Sätze','die Stichwörter','die Notizen','die Gespräche']);
const VIRR={sein:['bin','bist','ist','sind','seid','sind'],haben:['habe','hast','hat','haben','habt','haben'],möchten:['möchte','möchtest','möchte','möchten','möchtet','möchten']};
const VCHG={sprechen:'sprich',essen:'iss',helfen:'hilf',nehmen:'nimm',geben:'gib',treffen:'triff',lesen:'lies',sehen:'sieh',fahren:'fähr',schlafen:'schläf',waschen:'wäsch',laufen:'läuf'};
/* PLURALS for the 👥 Plural trainer: [singular exactly as its card in data/vocabulary.js, plural without "die", 'ws' = on the Nov 26 worksheet "8 Plural Forms"].
   The trainer works out which of the 8 patterns (–, -s, -n, -en/-nen, -e, ¨-e, -er, ¨-er) each noun uses. Add new nouns at the end. */
const PLURALS=[
['die Tafel','Tafeln','ws'],['das Lernplakat','Lernplakate','ws'],['die CD','CDs','ws'],['der CD-Player','CD-Player','ws'],['der Tisch','Tische','ws'],['der Stuhl','Stühle','ws'],['der Schwamm','Schwämme','ws'],['der Computer','Computer','ws'],['das Mäppchen','Mäppchen','ws'],
['der Videorekorder','Videorekorder','ws'],['der Radiergummi','Radiergummis','ws'],['das Buch','Bücher','ws'],['der Kuli','Kulis','ws'],['das Kind','Kinder','ws'],['die Lampe','Lampen','ws'],['der Fernseher','Fernseher','ws'],['die Tasche','Taschen','ws'],
['der Student','Studenten','ws'],['der Füller','Füller','ws'],['das Handy','Handys','ws'],['das Heft','Hefte','ws'],['die Lehrerin','Lehrerinnen','ws'],['das Waschbecken','Waschbecken','ws'],['der Projektor','Projektoren','ws'],['der Bleistift','Bleistifte','ws'],
['die Brille','Brillen','ws'],['das Taschentuch','Taschentücher','ws'],['der Becher','Becher','ws'],['das Fenster','Fenster','ws'],['der Ordner','Ordner','ws'],['der Papierkorb','Papierkörbe','ws'],['das Bild','Bilder','ws'],['die Studentin','Studentinnen','ws'],
/* more nouns from your lessons */
['der Lehrer','Lehrer'],['die Büroklammer','Büroklammern'],['die Straße','Straßen'],
['der Beamer','Beamer'],['die Schere','Scheren'],['der Stift','Stifte'],['die Jacke','Jacken'],['die Landkarte','Landkarten'],['die Fernbedienung','Fernbedienungen'],['die Übung','Übungen'],['das Kärtchen','Kärtchen'],['das Lineal','Lineale'],['der Kugelschreiber','Kugelschreiber'],
['das Mobiltelefon','Mobiltelefone'],['der Rucksack','Rucksäcke'],['die E-Mail','E-Mails'],['der Kalender','Kalender'],['der Würfel','Würfel'],['der Marker','Marker'],['der Locher','Locher'],['der Termin','Termine'],['die Pause','Pausen'],['die Uhr','Uhren'],['die Hausaufgabe','Hausaufgaben'],['das Diktat','Diktate'],['der Test','Tests'],['das Problem','Probleme'],['die Frage','Fragen'],['die Antwort','Antworten'],['das Formular','Formulare'],['der Kopierer','Kopierer'],
['der Laptop','Laptops'],['die Maus','Mäuse'],['die Heizung','Heizungen'],['die Tür','Türen'],['die Wand','Wände'],['die Decke','Decken'],['das Kabel','Kabel'],['der Stecker','Stecker'],['die Steckdose','Steckdosen'],['der Lichtschalter','Lichtschalter'],
['das Klassenzimmer','Klassenzimmer'],['das Büro','Büros'],['die Gitarre','Gitarren'],
['das Foto','Fotos'],['die Party','Partys'],['der Tipp','Tipps'],['die Sprache','Sprachen'],['der Film','Filme'],['der Freund','Freunde'],['der Kollege','Kollegen'],['die Person','Personen'],['der Satz','Sätze'],['das Stichwort','Stichwörter'],['die Notiz','Notizen'],['das Gespräch','Gespräche'],['der Erstsemester','Erstsemester']
];
