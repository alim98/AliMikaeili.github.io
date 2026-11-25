/* GRAMMAR LISTS the trainers rely on. Add to them when a lesson brings new words.

     G_SING    plural noun → its singular (der · die · das trainer explains plurals with it)
     G_PLURAL  nouns in the vocabulary that are plurals (always "die")
     VIRR      verbs with fully irregular present tense: [ich, du, er/sie/es, wir, ihr, sie/Sie]
     VCHG      stem-changing verbs: infinitive → changed stem used for du and er/sie/es
               (sprechen → sprich → du sprichst, er spricht)
*/
const G_SING={Studenten:'Student',Studentinnen:'Studentin',Fotos:'Foto',Kinder:'Kind',Bücher:'Buch',Filme:'Film',Partys:'Party',Sprachen:'Sprache',Tipps:'Tipp',Fragen:'Frage',Erstsemester:'Erstsemester',Freunde:'Freund',Lehrerinnen:'Lehrerin',Kollegen:'Kollege',Personen:'Person',Sätze:'Satz',Stichwörter:'Stichwort',Notizen:'Notiz',Gespräche:'Gespräch'};
const G_PLURAL=new Set(['die Studenten','die Studentinnen','die Fotos','die Kinder','die Bücher','die Filme','die Freizeitaktivitäten','die Partys','die Sprachen','die Tipps','die Fragen','die Erstsemester','die Freunde','die Lehrerinnen','die Kollegen','die Personen','die Studierenden','die Sätze','die Stichwörter','die Notizen','die Gespräche']);
const VIRR={sein:['bin','bist','ist','sind','seid','sind'],haben:['habe','hast','hat','haben','habt','haben'],möchten:['möchte','möchtest','möchte','möchten','möchtet','möchten']};
const VCHG={sprechen:'sprich',essen:'iss',helfen:'hilf',nehmen:'nimm',geben:'gib',treffen:'triff',lesen:'lies',sehen:'sieh',fahren:'fähr',schlafen:'schläf',waschen:'wäsch',laufen:'läuf'};
