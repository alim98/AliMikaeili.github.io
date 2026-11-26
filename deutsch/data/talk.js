/* ASK & ANSWER content for the 💬 Ask & answer trainer.

     TACTS       activities the trainer builds questions and answers from (fields below)
     TPAIRS      hand-written question/answer pairs (fields below); les = lesson that introduced it
     tEinPairs() "Ist das ein …? – Nein, das ist kein …" pairs built from the noun lists inside it
*/
/* activities built only from words already in the vocabulary. v = verb for conjugation, sep = separable prefix, x = word that stays (gern …), o = object, no = alternative for "Nein → …" */
const TACTS=[
{id:'schach',v:'spielen',o:'Schach',en:['play','plays'],eo:'chess',w:'Was',no:'Fußball',noEn:'football',t:'free'},
{id:'fussball',v:'spielen',o:'Fußball',en:['play','plays'],eo:'football',w:'Was',no:'Schach',noEn:'chess',t:'free'},
{id:'keyboard',v:'spielen',o:'Keyboard',en:['play','plays'],eo:'the keyboard',w:'Was',no:'Fußball',noEn:'football',t:'free'},
{id:'musik',v:'hören',o:'Musik',en:['listen to','listens to'],eo:'music',w:'Was',t:'free'},
{id:'buecher',v:'lesen',x:'in der Freizeit',o:'Bücher',en:['read','reads'],eo:'books',xen:'in {p} free time',w:'Was',t:'free'},
{id:'filme',v:'sehen',o:'Filme',en:['watch','watches'],eo:'films',w:'Was',t:'free'},
{id:'salsa',v:'tanzen',x:'gern',o:'Salsa',en:['like dancing','likes dancing'],eo:'salsa',w:'Was',t:'free'},
{id:'sport',v:'treiben',o:'Sport',en:['do','does'],eo:'sports',t:'free'},
{id:'sport2',v:'machen',x:'gern',o:'Sport',en:['like doing','likes doing'],eo:'sports',t:'free'},
{id:'laufen',v:'laufen',x:'gern',en:['like running','likes running'],t:'free',les:'Nov 18'},
{id:'kaffee',v:'trinken',x:'gern',o:'Kaffee',en:['like drinking','likes drinking'],eo:'coffee',w:'Was',no:'Tee',noEn:'tea',t:'free'},
{id:'formular',v:'füllen',sep:'aus',o:'ein Formular',en:['fill in','fills in'],eo:'a form',w:'Was',t:'free'},
{id:'ausgehen',v:'gehen',sep:'aus',o:'mit Freunden',en:['go out','goes out'],eo:'with friends',t:'free'},
{id:'freunde',v:'treffen',o:'Freunde',en:['meet','meets'],eo:'friends',t:'free'},
{id:'zeigen',v:'zeigen',o:'die Uni',en:['show','shows'],eo:'the university',w:'Was',t:'free'},
{id:'kennen',v:'kennen',o:'die Uni',en:['know','knows'],eo:'the university',t:'free'},
{id:'partys',v:'organisieren',o:'Partys',en:['organize','organizes'],eo:'parties',w:'Was',t:'free'},
{id:'computer',v:'haben',o:'einen Computer',en:['have','has'],eo:'a computer',no:'einen Laptop',noEn:'a laptop',t:'free'},
{id:'buddy',v:'arbeiten',o:'als Buddy',en:['work','works'],eo:'as a buddy',t:'free'},
{id:'spanisch',v:'üben',o:'Spanisch',en:['practise','practises'],eo:'Spanish',w:'Was',no:'Deutsch',noEn:'German',t:'free'},
{id:'deutsch',v:'lernen',o:'Deutsch',en:['learn','learns'],eo:'German',w:'Was',no:'Spanisch',noEn:'Spanish',t:'me'},
{id:'englisch',v:'sprechen',o:'Englisch',en:['speak','speaks'],eo:'English',w:'Welche Sprachen',wen:'Which languages',wAlt:['Was'],no:'Polnisch',noEn:'Polish',t:'me'},
{id:'bio',v:'studieren',o:'Biologie',en:['study','studies'],eo:'biology',w:'Was',no:'Musik',noEn:'music',t:'me'},
{id:'tuebingen',v:'wohnen',o:'in Tübingen',en:['live','lives'],eo:'in Tübingen',w:'Wo',no:'in Marburg',noEn:'in Marburg',t:'me'},
{id:'iran',v:'kommen',o:'aus dem Iran',en:['come','comes'],eo:'from Iran',w:'Woher',wTail:' from',no:'aus China',noEn:'from China',t:'me'},
{id:'indien',v:'kommen',o:'aus Indien',en:['come','comes'],eo:'from India',w:'Woher',wTail:' from',no:'aus Spanien',noEn:'from Spain',t:'me',les:'Nov 18'},
{id:'fotografieren',v:'fotografieren',x:'gern',en:['like taking photos','likes taking photos'],t:'free',les:'Nov 24'},
{id:'zeichnen',v:'zeichnen',x:'gern',en:['like drawing','likes drawing'],t:'free',les:'Nov 24'},
{id:'spazieren',v:'gehen',x:'gern',o:'spazieren',en:['like going for walks','likes going for walks'],t:'free',les:'Nov 24'},
{id:'musikgern',v:'hören',x:'gern',o:'Musik',en:['like listening to','likes listening to'],eo:'music',w:'Was',t:'free',les:'Nov 24'},
{id:'schachlieber',v:'spielen',x:'lieber',o:'Schach',en:['prefer playing','prefers playing'],eo:'chess',w:'Was',no:'Fußball',noEn:'football',t:'free',les:'Nov 24'}
];
/* hand-written question/answer pairs. q = accepted questions, a = accepted answers (first = book answer), cue = what to answer, hl = part to highlight when you have to ask for it */
const TPAIRS=[
{t:'me',q:['Wie heißt du?'],qen:'What is your name? (informal)',cue:'Ali',a:['Ich heiße Ali.','Mein Name ist Ali.'],aen:'My name is Ali.',hl:'Ali'},
{t:'me',q:['Wie heißen Sie?'],qen:'What is your name? (formal)',cue:'Ali',a:['Ich heiße Ali.','Mein Name ist Ali.'],aen:'My name is Ali.',hl:'Ali'},
{t:'me',q:['Woher kommst du?'],qen:'Where are you from? (informal)',cue:'Iran',a:['Ich komme aus dem Iran.'],aen:'I come from Iran.',hl:'aus dem Iran'},
{t:'me',q:['Woher kommen Sie?'],qen:'Where are you from? (formal)',cue:'Iran',a:['Ich komme aus dem Iran.'],aen:'I come from Iran.',hl:'aus dem Iran'},
{t:'me',q:['Wo wohnst du?','Wo lebst du?'],qen:'Where do you live?',cue:'Tübingen',a:['Ich wohne in Tübingen.','Ich lebe in Tübingen.'],aen:'I live in Tübingen.',hl:'in Tübingen'},
{t:'me',q:['Welche Sprachen sprichst du?','Was sprichst du?'],qen:'Which languages do you speak?',cue:'Englisch + Deutsch',a:['Ich spreche Englisch und Deutsch.','Ich spreche Deutsch und Englisch.'],aen:'I speak English and German.',hl:'Englisch und Deutsch'},
{t:'me',q:['Was lernst du?'],qen:'What are you learning?',cue:'Deutsch',a:['Ich lerne Deutsch.'],aen:'I am learning German.',hl:'Deutsch'},
{t:'me',q:['Wie geht es dir?',"Wie geht's dir?","Wie geht's?"],qen:'How are you? (informal)',cue:'🙂 gut',a:['Mir geht es gut.',"Mir geht's gut.",'Gut, danke.','Danke, gut.','Mir geht es gut, danke.',"Mir geht's gut, danke.",'Danke, mir geht es gut.',"Danke, mir geht's gut."],aen:'I am fine.',hl:'gut'},
{t:'me',q:['Wie geht es Ihnen?'],qen:'How are you? (formal)',cue:'🙂 gut – and ask back',a:['Mir geht es gut. Und Ihnen?',"Mir geht's gut. Und Ihnen?",'Gut, danke. Und Ihnen?','Danke, gut. Und Ihnen?','Mir geht es gut, danke. Und Ihnen?'],aen:'I am fine. And you?',noAsk:1},
{t:'me',q:['Was machst du in der Freizeit?'],qen:'What do you do in your free time? (informal)',cue:'Musik hören',a:['In der Freizeit höre ich Musik.','Ich höre in der Freizeit Musik.','Ich höre Musik.'],aen:'In my free time I listen to music.',hl:'höre ich Musik'},
{t:'me',q:['Was machen Sie in der Freizeit?'],qen:'What do you do in your free time? (formal)',cue:'Salsa tanzen',a:['In der Freizeit tanze ich Salsa.','Ich tanze in der Freizeit Salsa.','Ich tanze Salsa.'],aen:'In my free time I dance salsa.',hl:'tanze ich Salsa'},
{t:'me',q:['Was bist du von Beruf?','Was machst du beruflich?'],qen:'What is your job?',cue:'Student / Studentin',a:['Ich bin Student.','Ich bin Studentin.','Ich bin Student von Beruf.','Ich bin Studentin von Beruf.'],aen:'I am a student.',hl:'Student'},
{t:'me',q:['Was studierst du?'],qen:'What do you study?',cue:'Biologie',a:['Ich studiere Biologie.'],aen:'I study biology.',hl:'Biologie'},
{t:'me',q:['Wie alt bist du?'],qen:'How old are you?',cue:'30',a:['Ich bin 30 Jahre alt.','Ich bin dreißig Jahre alt.','Ich bin 30.','Ich bin dreißig.'],aen:'I am 30 years old.',hl:'30 Jahre alt'},
{t:'me',q:['Bist du verheiratet?'],qen:'Are you married?',cue:'✘ Nein → ledig',a:['Nein, ich bin ledig.','Nein, ich bin nicht verheiratet.'],aen:'No, I am single.'},
{t:'me',q:['Hast du Kinder?'],qen:'Do you have children?',cue:'✘ Nein',a:['Nein, ich habe keine Kinder.'],aen:'No, I have no children.'},
{t:'free',q:['Woher kommt Daniel?'],qen:'Where does Daniel come from?',cue:'Rostock',a:['Er kommt aus Rostock.','Daniel kommt aus Rostock.'],aen:'He comes from Rostock.',ap:'Daniel kommt aus Rostock.',hl:'aus Rostock'},
{t:'free',q:['Was studiert Daniel?'],qen:'What does Daniel study?',cue:'Musik',a:['Er studiert Musik.','Daniel studiert Musik.'],aen:'He studies music.',ap:'Daniel studiert Musik.',hl:'Musik'},
{t:'free',q:['Was macht Daniel?','Was macht Daniel beruflich?'],qen:'What does Daniel do (for work)?',cue:'als Buddy arbeiten',a:['Er arbeitet als Buddy.','Daniel arbeitet als Buddy.'],aen:'He works as a buddy.',ap:'Daniel arbeitet als Buddy.',hl:'arbeitet als Buddy'},
{t:'free',q:['Welche Sprachen spricht Daniel?','Was spricht Daniel?'],qen:'Which languages does Daniel speak?',cue:'Deutsch, Englisch, Polnisch',a:['Er spricht Deutsch, Englisch und Polnisch.','Daniel spricht Deutsch, Englisch und Polnisch.'],aen:'He speaks German, English and Polish.',ap:'Daniel spricht Deutsch, Englisch und Polnisch.',hl:'Deutsch, Englisch und Polnisch'},
{t:'free',q:['Was lernt Daniel?','Was übt Daniel?'],qen:'What is Daniel learning?',cue:'Spanisch',a:['Er lernt Spanisch.','Daniel lernt Spanisch.'],aen:'He is learning Spanish.',ap:'Daniel lernt Spanisch.',hl:'Spanisch'},
{t:'free',q:['Was macht ein Buddy?'],qen:'What does a buddy do?',cue:'die Uni zeigen + Tipps geben',a:['Ein Buddy zeigt die Uni und gibt Tipps.','Er zeigt die Uni und gibt Tipps.','Der Buddy zeigt die Uni und gibt Tipps.'],aen:'A buddy shows the university and gives tips.',hl:'zeigt die Uni und gibt Tipps'},
{t:'free',q:['Macht das Studium Spaß?'],qen:'Is studying fun?',cue:'✔ Ja',a:['Ja, das Studium macht Spaß.','Ja, es macht Spaß.'],aen:'Yes, studying is fun.'},
{t:'free',q:['Was organisiert das Buddy-Team?'],qen:'What does the buddy team organize?',cue:'Partys',a:['Das Buddy-Team organisiert Partys.','Es organisiert Partys.'],aen:'The buddy team organizes parties.',hl:'Partys'},
{t:'free',les:'Nov 18',q:['Wer oder was ist ein Buddy?','Was ist ein Buddy?','Wer ist ein Buddy?'],qen:'Who or what is a buddy?',cue:'eine Studentin oder ein Student',a:['Ein Buddy ist eine Studentin oder ein Student.','Ein Buddy ist ein Student oder eine Studentin.'],aen:'A buddy is a (female or male) student.',hl:'eine Studentin oder ein Student'},
{t:'free',les:'Nov 18',q:['Was machst du gern?'],qen:'What do you like doing?',cue:'laufen',a:['Ich laufe gern.'],aen:'I like running.',hl:'laufe'},
{t:'ein',les:'Nov 18',pron:1,q:['Wie ist der Buddy?'],qen:'What is the buddy like?',cue:'sehr nett',a:['Er ist sehr nett.','Der Buddy ist sehr nett.'],aen:'He (= der Buddy) is very nice.',ap:'Der Buddy ist sehr nett.',hl:'sehr nett'},
{t:'ein',les:'Nov 18',pron:1,q:['Wie ist der Deutschkurs?'],qen:'What is the German course like?',cue:'sehr wichtig',a:['Er ist sehr wichtig.','Der Deutschkurs ist sehr wichtig.'],aen:'It (= der Deutschkurs) is very important.',ap:'Der Deutschkurs ist sehr wichtig.',hl:'sehr wichtig'},
{t:'ein',les:'Nov 18',pron:1,q:['Ist der Deutschkurs voll?'],qen:'Is the German course full?',cue:'✔ Ja – immer',a:['Ja, er ist immer voll.','Ja, der Deutschkurs ist immer voll.'],aen:'Yes, it (= der Deutschkurs) is always full.',ap:'Ja, der Deutschkurs ist immer voll.'},
{t:'ein',les:'Nov 18',pron:1,q:['Wie ist das Studium?'],qen:'What is studying like?',cue:'super',a:['Es ist super.','Das Studium ist super.'],aen:'It (= das Studium) is great.',ap:'Das Studium ist super.',hl:'super'},
{t:'ein',les:'Nov 18',pron:1,q:['Ist das Studium einfach?'],qen:'Is studying easy?',cue:'✘ Nein',a:['Nein, es ist nicht einfach.','Nein, das Studium ist nicht einfach.'],aen:'No, it (= das Studium) is not easy.',ap:'Nein, das Studium ist nicht einfach.'},
{t:'ein',les:'Nov 18',pron:1,q:['Wie ist die Sprache?'],qen:'What is the language like?',cue:'nicht einfach, aber sehr interessant',a:['Sie ist nicht einfach, aber sehr interessant.','Sie ist nicht einfach, aber sie ist sehr interessant.','Die Sprache ist nicht einfach, aber sie ist sehr interessant.','Die Sprache ist nicht einfach, aber sehr interessant.'],aen:'It (= die Sprache) is not easy, but very interesting.',ap:'Die Sprache ist nicht einfach, aber sie ist sehr interessant.',hl:'nicht einfach, aber sie ist sehr interessant'},
{t:'ein',les:'Nov 18',pron:1,q:['Wie ist der Job?'],qen:'What is the job like?',cue:'sehr interessant',a:['Er ist sehr interessant.','Der Job ist sehr interessant.'],aen:'It (= der Job) is very interesting.',ap:'Der Job ist sehr interessant.',hl:'sehr interessant'},
{t:'ein',les:'Nov 18',pron:1,q:['Wie sind die Kollegen?'],qen:'What are the colleagues like?',cue:'sehr nett',a:['Sie sind sehr nett.','Die Kollegen sind sehr nett.'],aen:'They (= die Kollegen) are very nice.',ap:'Die Kollegen sind sehr nett.',hl:'sehr nett'},
{t:'ein',les:'Nov 18',pron:1,q:['Was geben die Kollegen?'],qen:'What do the colleagues give?',cue:'Tipps',a:['Sie geben Tipps.','Die Kollegen geben Tipps.'],aen:'They (= die Kollegen) give tips.',ap:'Die Kollegen geben Tipps.',hl:'Tipps'},
{t:'ein',les:'Nov 18',pron:1,q:['Woher kommt der Professor?'],qen:'Where does the professor come from?',cue:'Indien',a:['Er kommt aus Indien.','Der Professor kommt aus Indien.'],aen:'He (= der Professor) comes from India.',ap:'Der Professor kommt aus Indien.',hl:'aus Indien'},
{t:'ein',les:'Nov 18',pron:1,q:['Wie heißt die Deutschlehrerin?'],qen:"What is the German teacher's name?",cue:'Frau Hansen',a:['Sie heißt Frau Hansen.','Die Deutschlehrerin heißt Frau Hansen.'],aen:'Her (= die Deutschlehrerin) name is Ms Hansen.',ap:'Die Deutschlehrerin heißt Frau Hansen.',hl:'Frau Hansen'},
{t:'ein',les:'Nov 18',q:['Wer ist neu an der Uni?','Wer ist neu?'],qen:'Who is new at the university?',cue:'die Studentinnen',a:['Die Studentinnen sind neu an der Uni.','Die Studentinnen sind neu.'],aen:'The (female) students are new at the university.',hl:'Die Studentinnen'},
{t:'free',les:'Nov 24',q:['Was machst du gern?'],qen:'What do you like doing?',cue:'fotografieren',a:['Ich fotografiere gern.'],aen:'I like taking photos.',hl:'fotografiere'},
{t:'free',les:'Nov 24',q:['Was machst du gern?'],qen:'What do you like doing?',cue:'spazieren gehen',a:['Ich gehe gern spazieren.'],aen:'I like going for walks.',hl:'gehe gern spazieren'},
{t:'free',les:'Nov 24',q:['Was machst du lieber?'],qen:'What do you prefer doing?',cue:'tanzen',a:['Ich tanze lieber.'],aen:'I prefer dancing.',hl:'tanze'},
{t:'free',les:'Nov 24',q:['Spielst du gern Fußball?'],qen:'Do you like playing football?',cue:'✘ Nein → lieber Schach',a:['Nein, ich spiele lieber Schach.'],aen:'No, I prefer playing chess.',noAsk:1},
{t:'free',les:'Nov 24',q:['Tanzt du gern?'],qen:'Do you like dancing?',cue:'✔ Ja – but you prefer zeichnen',a:['Ja, aber ich zeichne lieber.','Ja, ich tanze gern, aber ich zeichne lieber.'],aen:'Yes, but I prefer drawing.',noAsk:1},
{t:'free',les:'Nov 24',q:['Was machst du am Wochenende?'],qen:'What do you do at the weekend?',cue:'mit Freunden ausgehen',a:['Am Wochenende gehe ich mit Freunden aus.','Ich gehe am Wochenende mit Freunden aus.','Ich gehe mit Freunden aus.'],aen:'At the weekend I go out with friends.',hl:'gehe ich mit Freunden aus'},
{t:'me',les:'Nov 24',q:['Wie geht es dir?',"Wie geht's dir?","Wie geht's?"],qen:'How are you? (informal)',cue:'😀 super – and ask back',a:['Mir geht es super. Und dir?',"Mir geht's super. Und dir?",'Super, danke. Und dir?','Mir geht es super, danke. Und dir?'],aen:'I am great. And you?',noAsk:1},
{t:'me',les:'Nov 24',q:['Wie geht es Ihnen?'],qen:'How are you? (formal)',cue:'🙂 gut, vielen Dank – and ask back',a:['Mir geht es gut, vielen Dank. Und Ihnen?',"Mir geht's gut, vielen Dank. Und Ihnen?",'Gut, vielen Dank. Und Ihnen?','Danke, mir geht es gut. Und Ihnen?'],aen:'I am fine, thank you very much. And you?',noAsk:1},
{t:'me',les:'Nov 24',q:['Kommen Sie morgen Abend zum Kurs?'],qen:'Are you coming to the course tomorrow evening? (formal)',cue:'✔ Ja – natürlich',a:['Ja, ich komme natürlich.','Ja, natürlich komme ich.','Ja, ich komme natürlich zum Kurs.','Ja, ich komme morgen Abend zum Kurs.'],aen:'Yes, of course I am coming.',ap:'Ja, ich komme morgen Abend zum Kurs.'},
{t:'me',les:'Nov 24',q:['Kommt ihr morgen zur Party?'],qen:'Are you (all) coming to the party tomorrow?',cue:'✔ Ja – natürlich',a:['Ja, wir kommen natürlich.','Ja, natürlich kommen wir.','Ja, wir kommen natürlich zur Party.','Ja, wir kommen morgen zur Party.'],aen:'Yes, of course we are coming.',ap:'Ja, wir kommen morgen zur Party.'},
{t:'me',les:'Nov 24',q:['Studierst du auch Biologie?'],qen:'Do you study biology too?',cue:'✘ Nein → Chemie',a:['Nein, ich studiere Chemie.'],aen:'No, I study chemistry.',noAsk:1},
{t:'me',les:'Nov 24',q:['Sprichst du Französisch?'],qen:'Do you speak French?',cue:'✔ Ja',a:['Ja, ich spreche Französisch.'],aen:'Yes, I speak French.'},
{t:'me',les:'Nov 24',q:['Wo studierst du Chemie?'],qen:'Where do you study chemistry?',cue:'Marburg',a:['Ich studiere Chemie in Marburg.','Ich studiere in Marburg Chemie.'],aen:'I study chemistry in Marburg.',hl:'in Marburg'},
{t:'ein',les:'Nov 24',q:['Ist das ein Tisch?'],qen:'Is that a table?',cue:'✘ Nein → Fenster',a:['Nein, das ist kein Tisch, das ist ein Fenster.','Nein, das ist kein Tisch. Das ist ein Fenster.','Nein, das ist ein Fenster.'],aen:'No, that is not a table, that is a window.'},
{t:'ein',les:'Nov 24',q:['Ist das ein Fenster?'],qen:'Is that a window?',cue:'✘ Nein → Tisch',a:['Nein, das ist kein Fenster, das ist ein Tisch.','Nein, das ist kein Fenster. Das ist ein Tisch.','Nein, das ist ein Tisch.'],aen:'No, that is not a window, that is a table.'},
{t:'ein',les:'Nov 24',q:['Was ist das?'],qen:'What is that?',cue:'Brille',a:['Das ist eine Brille.'],aen:'That is a pair of glasses.',hl:'eine Brille'},
{t:'ein',les:'Nov 24',q:['Hast du eine Brille?'],qen:'Do you have glasses?',cue:'✘ Nein',a:['Nein, ich habe keine Brille.'],aen:"No, I don't have glasses."},
{t:'people',les:'Nov 24',q:['Seid ihr auch hier im Deutschkurs?'],qen:'Are you (all) in the German course here too?',cue:'✔ Ja',a:['Ja, wir sind auch hier im Deutschkurs.','Ja, wir sind auch im Deutschkurs.','Ja, wir sind hier im Deutschkurs.'],aen:'Yes, we are in the German course here too.'},
{t:'people',les:'Nov 24',q:['Wie heißt ihr?'],qen:'What are your names? (you all)',cue:'Olivia und Noah',a:['Wir heißen Olivia und Noah.','Wir sind Olivia und Noah.'],aen:'Our names are Olivia and Noah.',hl:'Olivia und Noah'},
{t:'people',les:'Nov 24',q:['Woher kommt ihr?'],qen:'Where are you (all) from?',cue:'Kanada und die USA',a:['Wir kommen aus Kanada und aus den USA.','Wir kommen aus Kanada und den USA.'],aen:'We come from Canada and the USA.',hl:'aus Kanada und aus den USA'},
{t:'people',les:'Nov 24',q:['Was studiert ihr?'],qen:'What do you (all) study?',cue:'Informatik + Chemie',a:['Wir studieren Informatik und Chemie.','Wir studieren Chemie und Informatik.'],aen:'We study computer science and chemistry.',hl:'Informatik und Chemie'},
{t:'people',les:'Nov 24',q:['Woher kommt Olivia?'],qen:'Where does Olivia come from?',cue:'Kanada',a:['Sie kommt aus Kanada.','Olivia kommt aus Kanada.'],aen:'She comes from Canada.',ap:'Olivia kommt aus Kanada.',hl:'aus Kanada'},
{t:'people',les:'Nov 24',q:['Was studiert Noah?'],qen:'What does Noah study?',cue:'Chemie',a:['Er studiert Chemie.','Noah studiert Chemie.'],aen:'He studies chemistry.',ap:'Noah studiert Chemie.',hl:'Chemie'},
{t:'people',les:'Nov 24',q:['Woher kommt Noah?'],qen:'Where does Noah come from?',cue:'USA',a:['Er kommt aus den USA.','Noah kommt aus den USA.'],aen:'He comes from the USA.',ap:'Noah kommt aus den USA.',hl:'aus den USA'},
{t:'people',les:'Nov 24',q:['Woher kommt Dana?'],qen:'Where does Dana come from?',cue:'Almaty',a:['Sie kommt aus Almaty.','Dana kommt aus Almaty.'],aen:'She comes from Almaty.',ap:'Dana kommt aus Almaty.',hl:'aus Almaty'},
{t:'people',les:'Nov 24',q:['Was studiert Dana?'],qen:'What does Dana study?',cue:'Chemie',a:['Sie studiert Chemie.','Dana studiert Chemie.'],aen:'She studies chemistry.',ap:'Dana studiert Chemie.',hl:'Chemie'},
{t:'people',les:'Nov 24',q:['Kommt Dana morgen zur Party?'],qen:'Is Dana coming to the party tomorrow?',cue:'✔ Ja',a:['Ja, sie kommt morgen zur Party.','Ja, Dana kommt morgen zur Party.'],aen:'Yes, she is coming to the party tomorrow.',ap:'Ja, Dana kommt morgen zur Party.'},
{t:'people',les:'Nov 24',q:['Kommt Frau Klein aus Deutschland?'],qen:'Does Ms Klein come from Germany?',cue:'✔ Ja',a:['Ja, sie kommt aus Deutschland.','Ja, Frau Klein kommt aus Deutschland.'],aen:'Yes, she comes from Germany.',ap:'Ja, Frau Klein kommt aus Deutschland.'},
{t:'people',les:'Nov 24',q:['Wo wohnt Sarah?'],qen:'Where does Sarah live?',cue:'Marburg',a:['Sie wohnt in Marburg.','Sarah wohnt in Marburg.'],aen:'She lives in Marburg.',ap:'Sarah wohnt in Marburg.',hl:'in Marburg'},
{t:'people',les:'Nov 24',q:['Woher kommt Nelson Müller?'],qen:'Where does Nelson Müller come from?',cue:'Ghana',a:['Er kommt aus Ghana.','Nelson Müller kommt aus Ghana.'],aen:'He comes from Ghana.',ap:'Nelson Müller kommt aus Ghana.',hl:'aus Ghana'},
{t:'people',les:'Nov 24',q:['Wo wohnt Nelson Müller?'],qen:'Where does Nelson Müller live?',cue:'Essen',a:['Er wohnt in Essen.','Nelson Müller wohnt in Essen.'],aen:'He lives in Essen.',ap:'Nelson Müller wohnt in Essen.',hl:'in Essen'},
{t:'people',les:'Nov 24',q:['Was ist Nelson Müller von Beruf?','Was macht Nelson Müller beruflich?'],qen:"What is Nelson Müller's job?",cue:'Koch und Musiker',a:['Er ist Koch und Musiker.','Nelson Müller ist Koch und Musiker.','Er ist Koch und Musiker von Beruf.'],aen:'He is a cook and a musician.',ap:'Nelson Müller ist Koch und Musiker.',hl:'Koch und Musiker'},
{t:'people',les:'Nov 24',q:['Welche Sprachen spricht Nelson Müller?','Was spricht Nelson Müller?'],qen:'Which languages does Nelson Müller speak?',cue:'Deutsch + Englisch',a:['Er spricht Deutsch und Englisch.','Nelson Müller spricht Deutsch und Englisch.'],aen:'He speaks German and English.',ap:'Nelson Müller spricht Deutsch und Englisch.',hl:'Deutsch und Englisch'},
{t:'people',les:'Nov 24',q:['Woher kommt Christiane Seidel?'],qen:'Where does Christiane Seidel come from?',cue:'USA',a:['Sie kommt aus den USA.','Christiane Seidel kommt aus den USA.'],aen:'She comes from the USA.',ap:'Christiane Seidel kommt aus den USA.',hl:'aus den USA'},
{t:'people',les:'Nov 24',q:['Wo wohnt Christiane Seidel?'],qen:'Where does Christiane Seidel live?',cue:'Hamburg + New York',a:['Sie wohnt in Hamburg und New York.','Sie wohnt in Hamburg und in New York.','Christiane Seidel wohnt in Hamburg und New York.'],aen:'She lives in Hamburg and New York.',ap:'Christiane Seidel wohnt in Hamburg und New York.',hl:'in Hamburg und New York'},
{t:'people',les:'Nov 24',q:['Was ist Christiane Seidel von Beruf?','Was macht Christiane Seidel beruflich?'],qen:"What is Christiane Seidel's job?",cue:'Schauspielerin',a:['Sie ist Schauspielerin.','Christiane Seidel ist Schauspielerin.','Sie ist Schauspielerin von Beruf.'],aen:'She is an actress.',ap:'Christiane Seidel ist Schauspielerin.',hl:'Schauspielerin'},
{t:'people',les:'Nov 24',q:['Welche Sprachen spricht Christiane Seidel?','Was spricht Christiane Seidel?'],qen:'Which languages does Christiane Seidel speak?',cue:'Deutsch, Dänisch, Englisch',a:['Sie spricht Deutsch, Dänisch und Englisch.','Christiane Seidel spricht Deutsch, Dänisch und Englisch.'],aen:'She speaks German, Danish and English.',ap:'Christiane Seidel spricht Deutsch, Dänisch und Englisch.',hl:'Deutsch, Dänisch und Englisch'},
{t:'people',les:'Nov 24',q:['Woher kommt Ana Paula Morais?'],qen:'Where does Ana Paula Morais come from?',cue:'Brasilien',a:['Sie kommt aus Brasilien.','Ana Paula Morais kommt aus Brasilien.'],aen:'She comes from Brazil.',ap:'Ana Paula Morais kommt aus Brasilien.',hl:'aus Brasilien'},
{t:'people',les:'Nov 24',q:['Wo wohnt Ana Paula Morais?'],qen:'Where does Ana Paula Morais live?',cue:'Berlin',a:['Sie wohnt in Berlin.','Ana Paula Morais wohnt in Berlin.'],aen:'She lives in Berlin.',ap:'Ana Paula Morais wohnt in Berlin.',hl:'in Berlin'},
/* 🆕 Nov 26: saying no – nicht or kein? */
{t:'neg',les:'Nov 26',q:['Spielst du gut Gitarre?'],qen:'Do you play the guitar well?',cue:'✘ Nein',a:['Nein, ich spiele nicht gut Gitarre.'],aen:'No, I do not play the guitar well.'},
{t:'neg',les:'Nov 26',q:['Treibt Luis gern Sport?'],qen:'Does Luis like doing sports?',cue:'✘ Nein',a:['Nein, er treibt nicht gern Sport.','Nein, Luis treibt nicht gern Sport.'],aen:'No, he does not like doing sports.',ap:'Nein, Luis treibt nicht gern Sport.'},
{t:'neg',les:'Nov 26',q:['Ist ein Studium ein Hobby?'],qen:'Is a degree course a hobby?',cue:'✘ Nein',a:['Nein, ein Studium ist kein Hobby.','Nein, das ist kein Hobby.'],aen:'No, a degree course is not a hobby.'},
{t:'neg',les:'Nov 26',q:['Ist das ein Problem?'],qen:'Is that a problem?',cue:'✘ Nein',a:['Nein, das ist kein Problem.'],aen:'No, that is no problem.'},
{t:'neg',les:'Nov 26',q:['Tanzt du gern?'],qen:'Do you like dancing?',cue:'✘ Nein',a:['Nein, ich tanze nicht gern.'],aen:'No, I do not like dancing.'},
{t:'neg',les:'Nov 26',q:['Ist das schön?'],qen:'Is that nice?',cue:'✘ Nein',a:['Nein, das ist nicht schön.'],aen:'No, that is not nice.'},
{t:'neg',les:'Nov 26',q:['Hast du eine Brille?'],qen:'Do you have glasses?',cue:'✘ Nein',a:['Nein, ich habe keine Brille.'],aen:'No, I do not have glasses.'},
{t:'neg',les:'Nov 26',q:['Hast du eine Schere?'],qen:'Do you have a pair of scissors?',cue:'✘ Nein',a:['Nein, ich habe keine Schere.'],aen:'No, I do not have scissors.'},
{t:'neg',les:'Nov 26',q:['Wo ist der Radiergummi?'],qen:'Where is the eraser?',cue:'🤷 no idea',a:['Ich habe keine Ahnung.','Keine Ahnung.'],aen:'I have no idea.',noAsk:1},
{t:'neg',les:'Nov 26',q:['Was machst du am liebsten?'],qen:'What do you like doing most?',cue:'tanzen',a:['Am liebsten tanze ich.','Ich tanze am liebsten.'],aen:'Most of all I like dancing.'},
{t:'neg',les:'Nov 26',q:['Was macht Yu am liebsten?'],qen:'What does Yu like doing most?',cue:'zeichnen',a:['Am liebsten zeichnet sie.','Sie zeichnet am liebsten.','Am liebsten zeichnet Yu.','Yu zeichnet am liebsten.'],aen:'Most of all she likes drawing.',ap:'Am liebsten zeichnet Yu.'},
];
/* "Ist das ein …? – Nein, das ist kein …, das ist ein …" (Nov 18, page 19) for nouns you know */
function tEinPairs(){const ind=a=>a==='die'?'eine':'ein',out=[];
const TH=[['der','Ball','ball'],['das','Buch','book'],['der','Computer','computer'],['das','Formular','form'],['das','Keyboard','keyboard'],['der','Laptop','laptop'],['die','Uni','university'],['der','Film','film'],['die','Party','party'],['das','Hobby','hobby'],['die','Frage','question'],['die','Sprache','language']];
const PE=[['der','Student','student (m)'],['die','Studentin','student (f)'],['der','Professor','professor (m)'],['die','Professorin','professor (f)'],['der','Lehrer','teacher (m)'],['die','Lehrerin','teacher (f)'],['der','Buddy','buddy'],['der','Erstsemester','first-semester student'],['die','Deutschlehrerin','German teacher (f)'],['der','Kollege','colleague (m)'],['die','Kollegin','colleague (f)']];
const GR=[['Lehrerinnen','teachers (f)'],['Studentinnen','students (f)'],['Studenten','students'],['Kollegen','colleagues'],['Erstsemester','first-semester students']];
[[TH,'Was ist das?','What is that?'],[PE,'Wer ist das?','Who is that?']].forEach(([L,wq,wqen])=>L.forEach((A,i)=>{const B=L[(i+3)%L.length],a=ind(A[0])+' '+A[1],b=ind(B[0])+' '+B[1];
out.push({t:'ein',les:'Nov 18',q:[`Ist das ${a}?`],qen:`Is that a ${A[2]}?`,cue:`✘ Nein → ${B[1]}`,a:[`Nein, das ist k${a}, das ist ${b}.`,`Nein, das ist k${a}. Das ist ${b}.`,`Nein, das ist ${b}.`],aen:`No, that is not a ${A[2]}, that is a ${B[2]}.`});
out.push({t:'ein',les:'Nov 18',q:[`Ist das ${a}?`],qen:`Is that a ${A[2]}?`,cue:'✔ Ja',a:[`Ja, das ist ${a}.`],aen:`Yes, that is a ${A[2]}.`});
out.push({t:'ein',les:'Nov 18',q:[wq],qen:wqen,cue:A[1],a:[`Das ist ${a}.`],aen:`That is a ${A[2]}.`,hl:a});}));
GR.forEach((A,i)=>{const B=GR[(i+1)%GR.length];
out.push({t:'ein',les:'Nov 18',q:[`Sind das ${A[0]}?`],qen:`Are those ${A[1]}?`,cue:`✘ Nein → ${B[0]}`,a:[`Nein, das sind keine ${A[0]}, das sind ${B[0]}.`,`Nein, das sind keine ${A[0]}. Das sind ${B[0]}.`,`Nein, das sind ${B[0]}.`],aen:`No, those are not ${A[1]}, those are ${B[1]}.`});
out.push({t:'ein',les:'Nov 18',q:['Wer ist das?','Wer sind sie?','Wer sind das?'],qen:'Who is that?',cue:A[0],a:[`Das sind ${A[0]}.`],aen:`Those are ${A[1]}.`,hl:A[0]});});
/* 🆕 Nov 26: classroom objects – singular and plural */
const CL=[['der','Stuhl','a chair'],['der','Tisch','a table'],['die','Lampe','a lamp'],['die','Tafel','a board'],['der','Kuli','a ballpoint pen'],['der','Bleistift','a pencil'],['das','Lineal','a ruler'],['das','Heft','a notebook'],['die','Schere','a pair of scissors'],['der','Radiergummi','an eraser'],['das','Mäppchen','a pencil case'],['die','Tasche','a bag']];
CL.forEach((A,i)=>{const B=CL[(i+5)%CL.length],a=ind(A[0])+' '+A[1],b=ind(B[0])+' '+B[1],ane=A[2].replace(/^an? /,'');
out.push({t:'ein',les:'Nov 26',q:[`Ist das ${a}?`],qen:`Is that ${A[2]}?`,cue:`✘ Nein → ${B[1]}`,a:[`Nein, das ist k${a}, das ist ${b}.`,`Nein, das ist k${a}. Das ist ${b}.`,`Nein, das ist ${b}.`],aen:`No, that is not ${A[2]}, that is ${B[2]}.`});
out.push({t:'ein',les:'Nov 26',q:['Was ist das?'],qen:'What is that?',cue:A[1],a:[`Das ist ${a}.`],aen:`That is ${A[2]}.`,hl:a});});
const CP=[['Stühle','chairs','Tische','tables'],['Lampen','lamps','Tafeln','boards'],['Kulis','ballpoint pens','Bleistifte','pencils'],['Hefte','notebooks','Bücher','books'],['Scheren','pairs of scissors','Lineale','rulers'],['Taschen','bags','Rucksäcke','backpacks']];
CP.forEach(([A,Aen,B,Ben])=>{
out.push({t:'ein',les:'Nov 26',q:[`Sind das ${A}?`],qen:`Are those ${Aen}?`,cue:`✘ Nein → ${B}`,a:[`Nein, das sind keine ${A}, das sind ${B}.`,`Nein, das sind keine ${A}. Das sind ${B}.`,`Nein, das sind ${B}.`],aen:`No, those are not ${Aen}, those are ${Ben}.`});
out.push({t:'ein',les:'Nov 26',q:['Was ist das?','Was sind das?'],qen:'What is that?',cue:`${B} (plural)`,a:[`Das sind ${B}.`],aen:`Those are ${Ben}.`,hl:B});});
return out;}
