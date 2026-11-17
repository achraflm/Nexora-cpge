import { latex, type CourseContent } from './format'

export const mesures: CourseContent = {
  slug: 'mesures-incertitudes', subject: 'PHYS', level: 'SUP', title: 'Mesures et incertitudes', domain: 'Formation expérimentale',
  summary: 'Construire un résultat expérimental avec unité et incertitude-type, propager un budget, comparer deux mesures et interpréter une régression.',
  minutes: 180,
  sections: [
    { title: 'Mesurande, protocole et unités', latex: latex`Le mesurande est la grandeur que l’expérience cherche à déterminer. Avant la mesure, spécifier le dispositif, les conditions expérimentales et le modèle utilisé. « Longueur » peut désigner la distance entre deux repères ou la longueur d’une pièce à une température fixée. Les unités interviennent dès le tableau de données.

Noter la résolution, le calibre et les éventuelles corrections de zéro. Une erreur est l’écart à une valeur de référence connue. Une incertitude est une caractérisation de la dispersion des valeurs plausibles. Corriger un biais connu avant de chiffrer la dispersion restante.` },
    { title: 'Incertitude-type et précision', latex: latex`L’incertitude-type $u(x)$ s’exprime dans la même unité que $x$ et joue le rôle d’un écart-type. L’incertitude relative $u(x)/|x|$ est sans dimension si $x\ne0$. Deux instruments de résolution identique peuvent avoir des incertitudes différentes à cause de l’étalonnage ou du protocole.

Un résultat s’écrit avec une estimation, son incertitude, une unité et éventuellement un facteur d’élargissement explicitement annoncé.` },
    { title: 'Évaluation de type A', latex: latex`Pour $N\ge2$ mesures indépendantes et réalisées dans des conditions stables, calculer la moyenne et l’écart-type expérimental. Si le résultat retenu est la moyenne, sa contribution de type A vaut
$$ \bar x=\frac1N\sum_{i=1}^N x_i,\qquad
s=\sqrt{\frac{\sum_i(x_i-\bar x)^2}{N-1}},\qquad
u_A(\bar x)=\frac{s}{\sqrt N}. $$
Le dénominateur de la variance expérimentale vaut $N-1$ parce qu’on a déjà déterminé la moyenne à partir des mêmes observations. Relever une dérive dans les données avant d’appliquer aveuglément la formule. Une mesure unique n’a pas cette estimation de dispersion.` },
    { title: 'Évaluation de type B', latex: latex`Utiliser un certificat, une tolérance ou une information instrumentale. Si seule une borne symétrique $[-a,a]$ est connue et qu’on modélise toutes les valeurs de cet intervalle comme équiprobables, l’incertitude-type vaut $a/\sqrt3$. Pour un affichage de pas $q$ arrondi au pas le plus proche, la demi-largeur vaut $q/2$, donc $u=q/\sqrt{12}$.

Exemple. Un pas de $0{,}1\,\mathrm{mm}$ correspond sous ce modèle à $u\simeq0{,}029\,\mathrm{mm}$. Lire les notes du fabricant : une tolérance peut déjà englober la résolution.` },
    { title: 'Combinaison de contributions', latex: latex`Lorsque plusieurs contributions à la même grandeur sont indépendantes, additionner leurs variances, puis prendre la racine carrée. Une contribution commune à toutes les répétitions, comme un décalage d’étalonnage, ne se divise pas par $\sqrt N$. Augmenter le nombre de mesures diminue la contribution d’échantillonnage et ne corrige pas le décalage.` },
    { title: 'Propagation par linéarisation', latex: latex`Pour $y=f(x_1,\ldots,x_p)$, la formule au premier ordre repose sur une variation locale linéaire. Pour des entrées indépendantes,
$$ u(y)^2\simeq\sum_{j=1}^{p}\left(\frac{\partial f}{\partial x_j}\right)^2 u(x_j)^2. $$
Pour une somme ou une différence, les variances s’ajoutent dans les deux cas si les entrées sont indépendantes. Pour un produit $ab$ ou un quotient $a/b$, le carré de l’incertitude relative est la somme des carrés relatifs, pour des entrées non nulles. Un dénominateur proche de zéro peut invalider l’approximation linéaire.` },
    { title: 'Corrélations et simulation', latex: latex`Pour $y=a-b$, la variance devient $u(a)^2+u(b)^2-2\operatorname{cov}(a,b)$. Quand le même décalage additif figure dans les deux mesures, il s’élimine exactement dans la différence. Décrire chaque source une seule fois.

Pour une simulation, spécifier les distributions d’entrée puis générer des jeux cohérents de valeurs. À chaque tirage, évaluer la relation du modèle. L’écart-type des résultats estime l’incertitude de sortie. Si une entrée est commune à deux mesures, réutiliser le même tirage au lieu d’en tirer deux indépendamment.` },
    { title: 'Comparer deux résultats', latex: latex`Pour $x_1$ et $x_2$ indépendants, calculer
$$ z=\frac{|x_1-x_2|}{\sqrt{u(x_1)^2+u(x_2)^2}}. $$
Adopter le seuil donné par l’énoncé. Lorsqu’un seuil de $2$ est retenu, un écart inférieur au seuil est jugé compatible selon ce critère. Cela ne prouve pas l’égalité. Pour une référence dont l’incertitude est négligeable, le dénominateur se réduit à l’incertitude de la mesure.` },
    { title: 'Régression et résidus', latex: latex`Si le modèle prédit $y=ax+b$, représenter les données et calculer une droite ajustée. Sans pondération, la pente s’obtient par
$$ a=\frac{\sum_i(x_i-\bar x)(y_i-\bar y)}{\sum_i(x_i-\bar x)^2},\qquad b=\bar y-a\bar x. $$
Les résidus $r_i=y_i-(ax_i+b)$ permettent de juger l’accord du modèle : une courbure systématique suggère que la droite ne capture pas le phénomène. Préciser l’unité de la pente et justifier le choix d’une droite passant ou non par l’origine.` },
    { title: 'Présenter un résultat et rédiger au CNC', latex: latex`Conserver les valeurs intermédiaires sans arrondi prématuré. En fin de calcul, arrondir l’incertitude à un ou deux chiffres significatifs selon la convention retenue, puis arrondir le résultat au même rang décimal. Par exemple, $2{,}0368\,\mathrm V$ avec $u=0{,}0123\,\mathrm V$ devient $(2{,}037\pm0{,}012)\,\mathrm V$ avec deux chiffres pour l’incertitude.

Dans un bilan, écrire successivement la formule du mesurande, les contributions, les hypothèses d’indépendance et la conclusion. Identifier la contribution dominante avant de proposer une amélioration du protocole.` },
    { title: 'Fiche de révision', latex: latex`Type A pour les répétitions, type B pour les informations instrumentales. Passer par les variances pour combiner des contributions indépendantes. Comparer avec un écart normalisé en annonçant le seuil. Pour une droite, vérifier les résidus, les unités et les domaines d’extrapolation. Terminer par une écriture cohérente avec l’incertitude.` },
  ],
  exercises: [
    {
      ref: 'NEX-MES-01', title: 'Quatre lectures au banc optique', difficulty: 1,
      statement: latex`Quatre lectures indépendantes d’une position donnent $20{,}14$, $20{,}16$, $20{,}17$ et $20{,}13\,\mathrm{cm}$. Calculer la moyenne, l’écart-type expérimental et l’incertitude-type de la moyenne en ne tenant compte que des répétitions.`,
      hints: [latex`Les écarts à la moyenne se répartissent symétriquement.`, latex`L’incertitude recherchée concerne la moyenne de quatre valeurs.`],
      solution: [
        { title: 'Moyenne et dispersion', latex: latex`La moyenne est $20{,}15\,\mathrm{cm}$. Les écarts sont $-0{,}01$, $0{,}01$, $0{,}02$, $-0{,}02\,\mathrm{cm}$. La somme de leurs carrés vaut $0{,}0010\,\mathrm{cm^2}$ et $s=\sqrt{0{,}0010/3}\simeq0{,}0183\,\mathrm{cm}$.` },
        { title: 'Incertitude de la moyenne', latex: latex`On divise $s$ par $\sqrt4=2$. Ainsi $u_A\simeq0{,}0091\,\mathrm{cm}$. Avec un chiffre significatif pour $u_A$, le résultat devient $(20{,}150\pm0{,}009)\,\mathrm{cm}$ pour cette contribution seule.` },
      ],
    },
    {
      ref: 'NEX-MES-02', title: 'Résolution et étalonnage indépendants', difficulty: 2,
      statement: latex`Un voltmètre affiche $4{,}6\,\mathrm V$ avec un pas de $0{,}10\,\mathrm V$. Une erreur résiduelle d’étalonnage, indépendante de l’arrondi, est bornée à $\pm0{,}08\,\mathrm V$. Modéliser chaque erreur par une loi uniforme. Calculer les deux incertitudes-types et leur combinaison.`,
      hints: [latex`L’erreur d’arrondi est bornée à un demi-pas.`, latex`Calculer une variance pour chaque contribution.`],
      solution: [
        { title: 'Incertitudes élémentaires', latex: latex`Pour l’arrondi, $u_r=0{,}050/\sqrt3=0{,}0289\,\mathrm V$. Pour l’étalonnage, $u_e=0{,}080/\sqrt3=0{,}0462\,\mathrm V$.` },
        { title: 'Budget', latex: latex`L’indépendance donne $u=\sqrt{u_r^2+u_e^2}\simeq0{,}0545\,\mathrm V$. En adoptant deux chiffres significatifs pour $u$, on peut écrire $(4{,}600\pm0{,}054)\,\mathrm V$. L’étalonnage domine le budget.` },
      ],
    },
    {
      ref: 'NEX-MES-03', title: 'Mesurer une résistance par quotient', difficulty: 2,
      statement: latex`On estime une résistance par $R=U/I$. Les mesures indépendantes donnent $U=5{,}00\,\mathrm V$ avec $u(U)=0{,}04\,\mathrm V$, et $I=20{,}0\,\mathrm{mA}$ avec $u(I)=0{,}2\,\mathrm{mA}$. Calculer $R$, son incertitude et la contribution dominante.`,
      hints: [latex`Convertir $I$ en ampères pour la valeur de $R$.`, latex`Former les deux incertitudes relatives avant de les combiner.`],
      solution: [
        { title: 'Estimation et propagation', latex: latex`On trouve $R=250\,\mathrm\Omega$. Les contributions relatives valent $0{,}008$ et $0{,}010$. Leur combinaison vaut $\sqrt{0{,}008^2+0{,}010^2}\simeq0{,}0128$.` },
        { title: 'Bilan', latex: latex`L’incertitude-type vaut environ $3{,}2\,\mathrm\Omega$. À deux chiffres significatifs, $R=(250{,}0\pm3{,}2)\,\mathrm\Omega$. L’intensité représente la plus grande part de la variance relative.` },
      ],
    },
    {
      ref: 'NEX-MES-04', title: 'Deux valeurs de la pesanteur sont-elles compatibles ?', difficulty: 2,
      statement: latex`Deux expériences indépendantes donnent $g_1=9{,}84$ et $g_2=9{,}96\,\mathrm{m\,s^{-2}}$, avec incertitudes-types respectives $0{,}07$ et $0{,}04\,\mathrm{m\,s^{-2}}$. Pour un seuil de $2$, calculer l’écart normalisé et interpréter le résultat.`,
      hints: [latex`La différence des estimations vaut $0{,}12\,\mathrm{m\,s^{-2}}$.`, latex`Combiner les incertitudes de la différence au dénominateur.`],
      solution: [
        { title: 'Calcul', latex: latex`L’incertitude de la différence vaut $\sqrt{0{,}07^2+0{,}04^2}\simeq0{,}0806\,\mathrm{m\,s^{-2}}$. Ainsi $z\simeq1{,}49$.` },
        { title: 'Conclusion', latex: latex`Comme $1{,}49<2$, les valeurs sont compatibles pour le seuil annoncé. Le test ne prouve pas qu’elles sont exactement égales ni que les deux protocoles sont sans biais.` },
      ],
    },
    {
      ref: 'NEX-MES-05', title: 'Régression d’une position en fonction du temps', difficulty: 3,
      statement: latex`Aux temps $1$, $2$, $3$ et $4\,\mathrm s$, on mesure les positions $2{,}1$, $4{,}0$, $6{,}1$ et $8{,}0\,\mathrm{cm}$. Ajuster une droite $y=at+b$ sans pondération et calculer les quatre résidus. Interpréter l’unité de la pente.`,
      hints: [latex`Les moyennes sont $\bar t=2{,}5$ et $\bar y=5{,}05$.`, latex`Le dénominateur de la pente, en unités numériques, vaut $5$.`, latex`Calculer chaque prédiction avant de soustraire.`],
      solution: [
        { title: 'Calcul des coefficients', latex: latex`La somme des produits centrés vaut $9{,}90$. Ainsi $a=1{,}98\,\mathrm{cm\,s^{-1}}$ et $b=5{,}05-1{,}98\times2{,}5=0{,}10\,\mathrm{cm}$. La pente représente la vitesse pour ce modèle.` },
        { title: 'Résidus', latex: latex`Les prédictions sont $2{,}08$, $4{,}06$, $6{,}04$ et $8{,}02\,\mathrm{cm}$. Les résidus valent $0{,}02$, $-0{,}06$, $0{,}06$ et $-0{,}02\,\mathrm{cm}$. Leur somme est nulle à l’arrondi près. Pour juger l’accord quantitatif, il faudrait les comparer aux incertitudes des observations.` },
      ],
    },
    {
      ref: 'NEX-MES-06', title: 'Un zéro partagé par deux mesures', difficulty: 3,
      statement: latex`Deux positions $x_A$ et $x_B$ mesurées avec le même capteur possèdent des contributions indépendantes de $0{,}02$ et $0{,}03\,\mathrm{cm}$ et un même décalage additif de zéro, d’incertitude-type $0{,}05\,\mathrm{cm}$. Déterminer l’incertitude de $d=x_B-x_A$. Comparer avec le calcul qui considérerait chaque mesure totale comme indépendante.`,
      hints: [latex`Représenter le décalage commun par la même variable dans les deux expressions.`, latex`Séparer ce qui se simplifie de ce qui se propage.`],
      solution: [
        { title: 'Modèle à erreur commune', latex: latex`Le décalage s’annule dans la différence, donc $u(d)=\sqrt{0{,}02^2+0{,}03^2}\simeq0{,}036\,\mathrm{cm}$.` },
        { title: 'Comparaison', latex: latex`En supposant à tort l’indépendance des mesures totales, on ajouterait deux fois $0{,}05^2$ à la variance de la différence. Cela donnerait environ $0{,}079\,\mathrm{cm}$. Le capteur est le même dans les deux lectures, d’où la corrélation positive.` },
      ],
    },
  ],
  quiz: [
    { question: latex`Sous un modèle d’arrondi uniforme, quelle incertitude-type correspond à un pas $q$ ?`, answers: [latex`$q/\sqrt{12}$`, latex`$q$`, latex`$q\sqrt{12}$`], correct: 0, explanation: latex`La distribution uniforme a pour demi-largeur $q/2$.` },
    { question: 'Que devient un décalage commun quand on soustrait deux mesures ?', answers: ['Il double toujours', 'Il s’annule', 'Il est divisé par le nombre de répétitions'], correct: 1, explanation: 'Le même terme additif apparaît avec des signes opposés dans la différence.' },
    { question: 'Quelle information donne une courbure visible des résidus ?', answers: ['Le modèle linéaire peut être mal adapté', 'Toute incertitude est nulle', 'La pente est exactement connue'], correct: 0, explanation: 'Une organisation systématique des écarts indique un effet que la droite ne décrit pas.' },
  ],
}
