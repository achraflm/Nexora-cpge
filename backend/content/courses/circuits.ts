import { latex, type CourseContent } from './format'

export const circuits: CourseContent = {
  slug: 'lois-circuits-electriques', subject: 'PHYS', level: 'SUP', title: 'Lois générales des circuits électriques', domain: 'Électronique',
  summary: 'Délimiter l’ARQS, orienter les grandeurs électriques, écrire les lois de Kirchhoff et vérifier un bilan de puissance.',
  minutes: 180,
  sections: [
    { title: 'Quand peut-on négliger la propagation ?', latex: latex`Une variation électrique met un temps de l’ordre de $\tau_p=\ell/v$ à parcourir un circuit de taille caractéristique $\ell$, avec $v$ la vitesse de propagation dans le milieu. Dans l’approximation des régimes quasi-stationnaires (ARQS), ce temps est très petit devant la durée caractéristique de variation. Pour un signal périodique de fréquence $f$, on compare $\ell f/v$ à $1$. Un front bref impose de comparer $\tau_p$ à la durée du front, même si les impulsions se répètent lentement.

Exemple. Pour $\ell=30\,\mathrm{cm}$ et $v=2{,}0\times10^8\,\mathrm{m\,s^{-1}}$, on obtient $\tau_p=1{,}5\,\mathrm{ns}$. Ce temps est très inférieur à la période d’un signal sinusoïdal de $10\,\mathrm{kHz}$. On peut utiliser un même courant instantané le long d’une branche sans dérivation dans le modèle usuel.` },
    { title: 'Charge, débit et signe du courant', latex: latex`La charge $q$ se mesure en coulombs. On choisit un sens de référence à travers une section du conducteur. L’intensité algébrique $i$ est le débit de charge dans ce sens, soit $i=\mathrm dq_{\mathrm{tr}}/\mathrm dt$ si $q_{\mathrm{tr}}$ désigne la charge algébrique ayant traversé la section. Un ampère vaut un coulomb par seconde. Le courant conventionnel suit le transport de charges positives et s’oppose au mouvement des électrons dans un métal.

Sur un intervalle de temps, $\Delta q_{\mathrm{tr}}=\int i(t)\,\mathrm dt$. Un courant constant de $8\,\mathrm{mA}$ pendant $0{,}25\,\mathrm s$ transporte une charge algébrique de $2\,\mathrm{mC}$ dans le sens choisi. Un courant négatif se lit dans le sens inverse de sa flèche.` },
    { title: 'Nœuds et conservation de la charge', latex: latex`Un nœud modélise une jonction entre branches. Pour un petit volume entourant la jonction et contenant la charge $q_N$, le taux de variation $\mathrm dq_N/\mathrm dt$ est la différence entre les courants entrants et sortants. Dans le modèle de nœud idéal en ARQS, l’accumulation est négligeable, d’où
$$ \sum_{\mathrm{entrants}} i_k=\sum_{\mathrm{sortants}} i_k. $$
Un courant affecté à un côté de l’équation conserve son signe algébrique. Exemple. Deux courants orientés vers un nœud valent $7$ et $-2\,\mathrm{mA}$. Un courant orienté vers l’extérieur vaut alors $5\,\mathrm{mA}$ si ces trois branches sont les seules.` },
    { title: 'Potentiel, masse et tension', latex: latex`On choisit un point de référence auquel on attribue le potentiel $0$. Le potentiel d’un autre point dépend de cette référence. La tension $U_{AB}=V_A-V_B$ reste la même si tous les potentiels sont déplacés d’une même constante. La flèche de $U_{AB}$ pointe de $B$ vers $A$ dans la convention graphique utilisée ici.

Exemple. Avec $V_A=-1\,\mathrm V$ et $V_B=3\,\mathrm V$, on a $U_{AB}=-4\,\mathrm V$ et $U_{BA}=4\,\mathrm V$. Des points reliés par un fil idéal ont le même potentiel. La masse choisie pour le calcul est une référence de potentiel, et sa liaison éventuelle à la terre dépend du montage.` },
    { title: 'Maille et différences de potentiel', latex: latex`Dans le modèle de circuit à dipôles, les différences de potentiel le long d’un parcours fermé se compensent. Pour la boucle $A,B,C,A$,
$$ U_{AB}+U_{BC}+U_{CA}=0. $$
La flèche d’une tension et le sens de parcours sont deux choix distincts. Pour éviter les erreurs, écrire chaque terme avec les lettres dans l’ordre du parcours, puis traduire via la loi du dipôle. Exemple. Si $U_{AB}=6\,\mathrm V$ et $U_{BC}=-2\,\mathrm V$, alors $U_{AC}=4\,\mathrm V$ et $U_{CA}=-4\,\mathrm V$.` },
    { title: 'Conventions et caractère d’un dipôle', latex: latex`Soit $u=V_A-V_B$. En convention récepteur, le courant est orienté de $A$ vers $B$ dans le dipôle. Alors $p_{\text{reçue}}=ui$. En convention générateur, il est orienté de $B$ vers $A$ et $p_{\text{reçue}}=-ui$. Dans cette seconde convention, $ui$ est la puissance fournie algébrique.

Le caractère physique se déduit du signe de la puissance reçue, une fois la convention appliquée. Si $p_{\text{reçue}}>0$, le dipôle reçoit de l’énergie électrique. Si $p_{\text{reçue}}<0$, il en cède. Une batterie peut passer d’un rôle à l’autre lors de la décharge et de la recharge.` },
    { title: 'Puissance instantanée et énergie', latex: latex`Un volt-ampère vaut un watt pour le produit instantané $u(t)i(t)$. L’énergie reçue entre $t_1$ et $t_2$ vaut $W=\int_{t_1}^{t_2}p_{\text{reçue}}(t)\,\mathrm dt$, en joules. Lorsque la puissance est constante, on multiplie par la durée exprimée en secondes.

Dans un circuit idéal fermé, la somme des puissances reçues par tous les dipôles est nulle. Pour le voir, écrire chaque contribution sous la forme $(V_A-V_B)i_{A\to B}$. Une fois les coefficients regroupés par nœud, chaque coefficient est une somme algébrique de courants qui s’annule par conservation de la charge. Ce bilan permet de vérifier un calcul de signe ou une valeur de courant.` },
    { title: 'Premières applications avec un résistor', latex: latex`Le résistor idéal de résistance $R>0$ vérifie $u=Ri$ en convention récepteur. Sa puissance reçue est $Ri^2=u^2/R$. Si le courant calculé est négatif, il circule dans le sens opposé au choix initial et la dissipation reste positive. L’ohm vaut un volt par ampère.

Une branche alimentée par une source idéale de $5\,\mathrm V$ et contenant une résistance de $1\,\mathrm{k\Omega}$ est parcourue par $5\,\mathrm{mA}$ dans le sens de la chute de potentiel. La source fournit $25\,\mathrm{mW}$ et la résistance les dissipe. Sur table, vérifier l’ordre de grandeur des intensités et les limites de puissance des modèles employés.` },
    { title: 'Série, dérivation et mesure de tension', latex: latex`Deux dipôles sont en série si aucune autre branche ne part de leur jonction. Ils sont alors traversés par un même courant à un signe près. Deux dipôles sont en parallèle s’ils sont reliés aux mêmes deux nœuds. Leurs tensions sont alors égales avec la même orientation. Dans un montage avec dérivation, écrire la loi du nœud avant de supposer que deux courants sont égaux.

Un voltmètre se branche entre les deux points visés. Dans le modèle idéal, il ne prélève aucun courant. Un appareil réel dont la résistance d’entrée est finie ajoute une branche et peut déplacer les potentiels. Une mesure à vide et une mesure en charge peuvent donc donner des résultats différents.` },
    { title: 'Exemple à deux branches', latex: latex`Une source maintient $V_A=6\,\mathrm V$ et $V_B=0$. Deux résistances de $2\,\mathrm{k\Omega}$ et $3\,\mathrm{k\Omega}$ relient chacune $A$ à $B$. La loi de comportement fournit $3$ et $2\,\mathrm{mA}$ dans le sens $A$ vers $B$. Pour conserver la charge, la source renvoie $5\,\mathrm{mA}$ vers $A$.

Les puissances reçues par les résistances valent $18$ et $12\,\mathrm{mW}$. Comme son courant entre en $B$, la source reçoit $(V_B-V_A)\times5\,\mathrm{mA}=-30\,\mathrm{mW}$. Le bilan est nul. La même procédure s’applique quand un des courants sort avec un signe négatif.` },
    { title: 'Méthode pour un montage à plusieurs nœuds', latex: latex`Nommer les nœuds, fixer la référence de potentiel et attribuer des orientations aux courants. Si la source fournit directement un potentiel par rapport à la référence, remplacer cette inconnue par sa valeur. Pour une résistance entre $A$ et $B$, le courant orienté de $A$ vers $B$ vaut $(V_A-V_B)/R$. Écrire les lois des nœuds avec les inconnues restantes, ou choisir des mailles utiles si les inconnues retenues sont des courants.

Résoudre en gardant les unités. Retrouver les courants et tensions demandés, interpréter les signes, puis vérifier une relation que l’on n’a pas utilisée dans la résolution. L’analyse d’un circuit simple ne demande pas de mémoriser une formule générale de réseau.` },
    { title: 'Fiche de révision', latex: latex`ARQS : comparer le temps de propagation à la durée des variations. Au nœud : conserver la charge. Dans une maille : fermer la somme algébrique des tensions. En convention récepteur : $p_{\text{reçue}}=ui$. Pour une résistance : $p=Ri^2$. En fin d’exercice, contrôler les signes, les unités et la somme des puissances.` },
  ],
  exercises: [
    {
      ref: 'NEX-CIR-01', title: 'Propagation et courants signés', difficulty: 1,
      statement: latex`Sur une carte de taille $15\,\mathrm{cm}$, prendre $v=2{,}0\times10^8\,\mathrm{m\,s^{-1}}$. Comparer le temps de propagation aux périodes de signaux de $2$ et $500\,\mathrm{MHz}$. À basse fréquence, deux flèches entrantes d’un nœud portent $3{,}5$ et $-1{,}2\,\mathrm{mA}$. Une flèche sortante porte $0{,}8\,\mathrm{mA}$. Déterminer le courant orienté suivant la quatrième flèche, sortante.`,
      hints: [latex`Calculer le rapport $\tau_p/T=\ell f/v$.`, latex`Écrire la loi des nœuds en conservant le signe $-1{,}2$.`],
      solution: [
        { title: 'Ordres de grandeur', latex: latex`Le temps de propagation vaut $0{,}75\,\mathrm{ns}$. Pour $2\,\mathrm{MHz}$, la période vaut $500\,\mathrm{ns}$ et le rapport vaut $0{,}0015$. Pour $500\,\mathrm{MHz}$, la période vaut $2\,\mathrm{ns}$ et le rapport vaut $0{,}375$. L’ARQS est bien justifiée par ce critère dans le premier cas. Pour le second, il faut tenir compte du retard de propagation.` },
        { title: 'Bilan de charge', latex: latex`Les valeurs en milliampères vérifient $3{,}5-1{,}2=0{,}8+i_4$, donc $i_4=1{,}5\,\mathrm{mA}$. Le courant associé à $-1{,}2\,\mathrm{mA}$ quitte réellement le nœud, bien que sa flèche soit entrante.` },
      ],
    },
    {
      ref: 'NEX-CIR-02', title: 'Deux sources opposées', difficulty: 2,
      statement: latex`Dans une maille série, le parcours choisi traverse une source de $18\,\mathrm V$ du pôle négatif au positif, une résistance de $4\,\mathrm\Omega$, puis une source de $6\,\mathrm V$ du pôle positif au négatif et une résistance de $2\,\mathrm\Omega$. Orienter le courant suivant ce parcours. Donner son signe, les quatre puissances reçues et le rôle des deux sources.`,
      hints: [latex`Dans le sens parcouru, la première source augmente le potentiel, la seconde le fait baisser.`, latex`Repérer la borne d’entrée du courant dans chacune des deux sources.`],
      solution: [
        { title: 'Équation de maille', latex: latex`La somme des variations de potentiel est $18-4i-6-2i=0$. Il vient $i=2\,\mathrm A$ dans le sens choisi.` },
        { title: 'Bilan de puissance', latex: latex`La source de $18\,\mathrm V$ reçoit $-36\,\mathrm W$ et fournit donc de l’énergie. La source de $6\,\mathrm V$ reçoit $12\,\mathrm W$. Les deux résistances dissipent $16$ et $8\,\mathrm W$. On vérifie $-36+12+16+8=0$.` },
      ],
    },
    {
      ref: 'NEX-CIR-03', title: 'Une sortie avec et sans charge', difficulty: 2,
      statement: latex`Une source impose $V_A=12\,\mathrm V$ par rapport à la masse. Une résistance de $2\,\mathrm{k\Omega}$ relie $A$ à $B$, et une de $4\,\mathrm{k\Omega}$ relie $B$ à la masse. Calculer $V_B$. On ajoute ensuite une charge de $4\,\mathrm{k\Omega}$ entre $B$ et la masse. Recalculer $V_B$ et les trois courants dans les résistances.`,
      hints: [latex`Écrire la loi des nœuds en $B$ dans les deux situations.`, latex`Une même tension alimente les deux branches de $4\,\mathrm{k\Omega}$.`],
      solution: [
        { title: 'Sortie sans charge', latex: latex`Les valeurs en volts et kilo-ohms donnent $(12-V_B)/2=V_B/4$, d’où $V_B=8\,\mathrm V$. Le courant vaut $2\,\mathrm{mA}$.` },
        { title: 'Sortie en charge', latex: latex`Avec la nouvelle branche, $(12-V_B)/2=V_B/4+V_B/4$. On obtient $V_B=6\,\mathrm V$. Le courant entrant en $B$ vaut $3\,\mathrm{mA}$. Il se partage en deux courants de $1{,}5\,\mathrm{mA}$, dirigés vers la masse.` },
      ],
    },
    {
      ref: 'NEX-CIR-04', title: 'Énergie reçue sous deux impulsions', difficulty: 2,
      statement: latex`Un dipôle est parcouru par un courant de $30\,\mathrm{mA}$ orienté de $A$ vers $B$ pendant $0{,}20\,\mathrm s$, avec $U_{AB}=4{,}0\,\mathrm V$. Pendant les $0{,}10\,\mathrm s$ suivantes, $U_{AB}=4{,}0\,\mathrm V$ et le courant signé vaut $-10\,\mathrm{mA}$. Calculer la charge algébrique transférée de $A$ vers $B$, la puissance reçue sur chaque intervalle et l’énergie nette reçue.`,
      hints: [latex`Le sens du courant de référence définit le signe du débit de charge.`, latex`Sur chaque intervalle, énergie et charge sont proportionnelles à sa durée.`],
      solution: [
        { title: 'Charge transférée', latex: latex`Les contributions sont $30\times0{,}20=6\,\mathrm{mC}$ et $-10\times0{,}10=-1\,\mathrm{mC}$. La charge algébrique totale vaut $5\,\mathrm{mC}$.` },
        { title: 'Puissances et énergie', latex: latex`En convention récepteur, les puissances reçues sont $120$ puis $-40\,\mathrm{mW}$. Le dipôle cède de l’énergie pendant le second intervalle. Le bilan vaut $120\times0{,}20-40\times0{,}10=20\,\mathrm{mJ}$.` },
      ],
    },
    {
      ref: 'NEX-CIR-05', title: 'Influence du voltmètre', difficulty: 3,
      statement: latex`Un point $B$ est relié par $60\,\mathrm{k\Omega}$ à un point de potentiel $9\,\mathrm V$, et par $30\,\mathrm{k\Omega}$ à la masse. Calculer la tension sans appareil. On mesure ensuite $V_B$ avec un voltmètre de résistance d’entrée $90\,\mathrm{k\Omega}$. Prévoir sa lecture et l’écart relatif signé par rapport à la tension sans appareil.`,
      hints: [latex`Le voltmètre relie $B$ à la masse et prélève un courant.`, latex`Écrire la somme des courants sortants de $B$ dans chaque situation.`],
      solution: [
        { title: 'Tension sans appareil', latex: latex`L’équation $(9-V_B)/60=V_B/30$ donne $V_B=3\,\mathrm V$.` },
        { title: 'Tension lue et écart', latex: latex`La loi des nœuds devient $(9-V_B)/60=V_B/30+V_B/90$. Après multiplication par $180$, $27-3V_B=8V_B$, soit $V_B=27/11\,\mathrm V\simeq2{,}45\,\mathrm V$. L’écart relatif signé vaut $-2/11\simeq-18{,}2\,\%$. Le courant supplémentaire dans le voltmètre explique la baisse.` },
      ],
    },
    {
      ref: 'NEX-CIR-06', title: 'Deux nœuds et un bilan complet', difficulty: 3,
      statement: latex`Une source fixe $V_A=12\,\mathrm V$ par rapport à la masse. Les résistances sont $R_{AB}=2\,\mathrm{k\Omega}$, $R_{BC}=1\,\mathrm{k\Omega}$, $R_{B0}=2\,\mathrm{k\Omega}$ et $R_{C0}=2\,\mathrm{k\Omega}$, où $0$ désigne la masse. Calculer $V_B$, $V_C$ et les quatre courants orientés suivant l’ordre des indices. Comparer la puissance fournie par la source à la somme des puissances dissipées.`,
      hints: [latex`Au nœud $C$, la seule arrivée possible vient de $B$.`, latex`Déduire $V_C$ de $V_B$ puis utiliser la loi du nœud $B$.`, latex`Exprimer les puissances en milliwatts pour des résistances en kilo-ohms et des courants en milliampères.`],
      solution: [
        { title: 'Équations de nœuds', latex: latex`En $C$, $V_B-V_C=V_C/2$, soit $V_C=2V_B/3$. En $B$, $(12-V_B)/2=V_B/2+V_B-V_C$. On trouve $V_B=4{,}5\,\mathrm V$ et $V_C=3{,}0\,\mathrm V$.` },
        { title: 'Courants et puissances', latex: latex`Dans l’ordre $AB,BC,B0,C0$, les courants valent $3{,}75$, $1{,}50$, $2{,}25$ et $1{,}50\,\mathrm{mA}$. Les puissances dissipées sont $28{,}125$, $2{,}25$, $10{,}125$ et $4{,}50\,\mathrm{mW}$, soit $45\,\mathrm{mW}$ au total. La source fournit $12\times3{,}75=45\,\mathrm{mW}$.` },
      ],
    },
  ],
  quiz: [
    { question: latex`Un courant orienté sortant d’un nœud est calculé égal à $-3\,\mathrm{mA}$. Comment le lire ?`, answers: [latex`$3\,\mathrm{mA}$ sortent`, latex`$3\,\mathrm{mA}$ entrent`, 'La loi des nœuds est violée'], correct: 1, explanation: 'Un signe négatif inverse le sens physique par rapport à la flèche de référence.' },
    { question: latex`En convention récepteur, $u=6\,\mathrm V$ et $i=-0{,}5\,\mathrm A$. Quelle puissance le dipôle reçoit-il ?`, answers: [latex`$-3\,\mathrm W$`, latex`$3\,\mathrm W$`, latex`$0\,\mathrm W$`], correct: 0, explanation: 'Le produit est négatif. Le dipôle fournit trois watts.' },
    { question: latex`Quelle comparaison convient à l’ARQS pour une sinusoïde ?`, answers: [latex`$f\gg v/\ell$`, latex`$\ell f/v=1$`, latex`$\ell f/v\ll1$`], correct: 2, explanation: 'Le temps de propagation doit être très petit devant la période.' },
  ],
}
