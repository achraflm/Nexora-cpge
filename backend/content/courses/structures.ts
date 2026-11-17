import { latex, type CourseContent } from './format'

export const structures: CourseContent = {
  slug: 'structures-algebriques-usuelles', subject: 'MATH', level: 'SPE', title: 'Structures algébriques usuelles', domain: 'Algèbre',
  summary: 'Relier groupes, morphismes, idéaux et congruences, puis exploiter les propriétés de ces structures dans les calculs entiers et polynomiaux.',
  minutes: 210,
  sections: [
    { title: 'Objectifs et prérequis', latex: latex`Revoir divisibilité, polynômes et lois de composition de MPSI. En MP, il faut décider quelles opérations sont disponibles, travailler avec des morphismes et passer aux classes de congruence. Identifier la structure avant de simplifier une égalité. La multiplication n’est pas toujours commutative et tous les éléments non nuls ne s’inversent pas.` },
    { title: 'Groupes et sous-groupes', latex: latex`Un groupe est muni d’une loi interne associative, d’un neutre et d’un inverse pour chaque élément. Il est abélien si la loi est commutative. Dans un sous-ensemble $H$ non vide de $G$, la condition $xy^{-1}\in H$ pour tous $x,y\in H$ suffit pour que $H$ soit un sous-groupe. En posant $x=y$, on récupère le neutre, puis les inverses, puis les produits.

L’intersection d’une famille de sous-groupes reste un sous-groupe. Une réunion de deux sous-groupes ne l’est généralement pas, car les produits mélangés peuvent sortir de la réunion.` },
    { title: 'Sous-groupe engendré et ordre', latex: latex`Les puissances $g^n$, pour $n\in\mathbb Z$, forment le plus petit sous-groupe contenant $g$. Si $g^m=e$ pour un entier positif $m$, l’ordre de $g$ est le plus petit tel $m$. La division euclidienne de $n$ par $m$ montre alors que $g^n=e$ équivaut à $m\mid n$.

Dans un groupe fini, les classes à gauche d’un sous-groupe $H$ partitionnent le groupe et sont en bijection avec $H$ par translation. Ainsi $|H|$ divise $|G|$. En particulier, l’ordre d’un élément divise le cardinal du groupe.` },
    { title: 'Morphismes, noyau et image', latex: latex`Un morphisme $f:G\to H$ vérifie $f(xy)=f(x)f(y)$. Il envoie le neutre sur le neutre et un inverse sur l’inverse correspondant. L’image et le noyau sont des sous-groupes. Pour tester l’injectivité, utiliser
$$ f(x)=f(y)\iff f(y^{-1}x)=e_H. $$
Le morphisme est donc injectif exactement lorsque son noyau est réduit au neutre. Pour un morphisme additif, remplacer $y^{-1}x$ par $x-y$.` },
    { title: 'Anneaux, corps et éléments inversibles', latex: latex`Dans un anneau, l’addition constitue un groupe abélien et la multiplication est associative et distributive. On travaille avec un neutre multiplicatif. Une unité est un élément muni d’un inverse multiplicatif. Dans un corps, tout élément non nul est inversible. Dans un anneau intègre commutatif non nul, un produit de deux éléments non nuls ne peut être nul.

Dans $\mathbb Z$, seules $1$ et $-1$ sont des unités. Dans $\mathbb Z/6\mathbb Z$, les classes de $2$ et de $3$ sont non nulles, mais leur produit vaut zéro. On ne peut donc simplifier par un facteur sans hypothèse.` },
    { title: 'Idéaux et divisibilité dans les entiers', latex: latex`Un idéal d’un anneau commutatif est un sous-groupe additif stable par multiplication par tout élément de l’anneau. Dans $\mathbb Z$, un idéal non nul possède un plus petit entier strictement positif $d$. La division euclidienne de tout élément de l’idéal par $d$ donne un reste dans l’idéal, nécessairement nul par minimalité. Ainsi les idéaux sont les $d\mathbb Z$.

L’idéal $a\mathbb Z+b\mathbb Z$ a pour générateur positif le PGCD $d$ lorsque $a,b$ ne sont pas simultanément nuls. En particulier, il existe $u,v\in\mathbb Z$ tels que $au+bv=d$. Les divisions successives donnent un moyen de trouver ces coefficients.` },
    { title: 'Calcul modulo un entier', latex: latex`Deux entiers sont dans la même classe modulo $n$ si leur différence est divisible par $n$. Les opérations s’effectuent sur les représentants et donnent la même classe quel que soit le choix des représentants. La classe de $a$ est inversible modulo $n$ exactement quand $\gcd(a,n)=1$ : l’identité de Bézout donne un inverse, et un inverse force le PGCD à valoir $1$.

Plus généralement, $ax\equiv b\pmod n$ admet une solution si et seulement si $d=\gcd(a,n)$ divise $b$. Lorsque c’est le cas, diviser l’égalité entière correspondante par $d$, donc réduire aussi le module à $n/d$. On résout alors avec un coefficient inversible.` },
    { title: 'Congruences simultanées et puissances', latex: latex`Si $m$ et $n$ sont premiers entre eux, deux congruences modulo $m$ et modulo $n$ déterminent une classe unique modulo $mn$. Écrire $x=a+mk$ pour satisfaire la première, puis utiliser l’inverse de $m$ modulo $n$ dans la seconde. L’unicité vient du fait qu’une différence divisible par $m$ et par $n$ est divisible par $mn$.

Dans $\mathbb Z/p\mathbb Z$ pour $p$ premier, les classes non nulles forment un groupe de cardinal $p-1$. L’ordre d’une classe y divise $p-1$. On obtient $a^{p-1}\equiv1\pmod p$ pour $p\nmid a$, ce qui permet de réduire certains exposants.` },
    { title: 'Polynômes, idéaux et algèbres', latex: latex`Dans $\mathbb K[X]$, la division par un polynôme non nul donne un reste de degré strictement plus petit. Choisir dans un idéal non nul un polynôme unitaire de degré minimal montre que l’idéal est engendré par ce polynôme. Appliquer la division euclidienne et la propriété d’idéal exactement comme pour les entiers.

Une $\mathbb K$-algèbre possède à la fois une structure d’espace vectoriel sur $\mathbb K$ et une multiplication bilinéaire compatible. Les matrices carrées en donnent un exemple, dont la multiplication est en général non commutative. Dans une identité avec des matrices, conserver l’ordre des facteurs.` },
    { title: 'Exemple et méthode CNC', latex: latex`Pour inverser $11$ modulo $28$, les divisions $28=2\times11+6$, $11=6+5$, $6=5+1$ donnent $1=2\times28-5\times11$. Ainsi $-5$, ou $23$ modulo $28$, est l’inverse voulu. Dans un problème de morphismes, identifier le neutre d’arrivée pour écrire le noyau. Dans un problème de divisibilité, chercher un générateur ou un PGCD avant tout développement.` },
    { title: 'Fiche de révision', latex: latex`Sous-groupe : non-vacuité et stabilité par $xy^{-1}$. Noyau trivial : morphisme injectif. Unité modulo $n$ : PGCD égal à $1$. Idéal engendré par deux éléments : remonter Euclide. Congruences : tenir compte du module lorsqu’on divise. Matrices : conserver l’ordre des produits.` },
  ],
  exercises: [
    {
      ref: 'NEX-STR-01', title: 'Un sous-groupe défini par une contrainte additive', difficulty: 1,
      statement: latex`Dans $(\mathbb Z^2,+)$, soit $H=\{(a,b)\mid a-2b\in3\mathbb Z\}$. Montrer que $H$ est un sous-groupe et que tout élément de $H$ s’écrit de manière unique comme combinaison entière de $(3,0)$ et $(2,1)$.`,
      hints: [latex`Utiliser la stabilité par différence.`, latex`Écrire $a-2b=3k$ et lire la seconde coordonnée.`],
      solution: [
        { title: 'Sous-groupe', latex: latex`Le couple nul appartient à $H$. Pour deux couples de $H$, la différence de leurs expressions $a-2b$ est encore divisible par $3$. La différence des couples appartient donc à $H$.` },
        { title: 'Générateurs', latex: latex`La relation $a=3k+2b$ donne $(a,b)=k(3,0)+b(2,1)$. Réciproquement, une telle combinaison vérifie le critère. La seconde coordonnée détermine $b$, puis la première détermine $k$.` },
      ],
    },
    {
      ref: 'NEX-STR-02', title: 'Ordre et image d’un sous-groupe cyclique', difficulty: 2,
      statement: latex`Dans le groupe additif $\mathbb Z/30\mathbb Z$, déterminer l’ordre de $\overline{12}$, puis décrire le sous-groupe qu’il engendre. Préciser le noyau et l’image de $n\mapsto\overline{12n}$ sur $\mathbb Z$.`,
      hints: [latex`Le neutre est $\overline0$.`, latex`Réduire la divisibilité $30\mid12n$ par le PGCD.`],
      solution: [
        { title: 'Ordre', latex: latex`On a $30\mid12n$ si et seulement si $5\mid2n$, donc exactement si $5\mid n$. L’ordre est $5$ et le noyau du morphisme est $5\mathbb Z$.` },
        { title: 'Image', latex: latex`Les cinq classes obtenues sont $\overline0$, $\overline{12}$, $\overline{24}$, $\overline6$ et $\overline{18}$. Ce sont précisément les classes multiples de $\overline6$.` },
      ],
    },
    {
      ref: 'NEX-STR-03', title: 'Une congruence à coefficient non inversible', difficulty: 2,
      statement: latex`Résoudre $14x\equiv21\pmod{35}$. Énumérer toutes les classes solutions modulo $35$. Expliquer ce qui change lorsque le second membre vaut $22$.`,
      hints: [latex`Calculer $\gcd(14,35)$.`, latex`Diviser l’égalité entière $14x-21=35k$ avant de revenir aux congruences.`],
      solution: [
        { title: 'Module réduit', latex: latex`L’égalité équivaut à $2x-3=5k$. L’inverse de $2$ modulo $5$ vaut $3$, donc $x\equiv4\pmod5$.` },
        { title: 'Retour au module initial', latex: latex`Les classes modulo $35$ sont représentées par $4,9,14,19,24,29,34$. Avec $22$, l’équation est impossible, car les multiples de $14$ et de $35$ sont divisibles par $7$, contrairement à $22$.` },
      ],
    },
    {
      ref: 'NEX-STR-04', title: 'Synchronisation de deux compteurs', difficulty: 2,
      statement: latex`Trouver les entiers $t$ tels que $t\equiv4\pmod9$ et $t\equiv6\pmod{14}$. Donner le plus petit entier positif qui convient et justifier l’unicité de la classe.`,
      hints: [latex`Poser $t=4+9k$.`, latex`Chercher l’inverse de $9$ modulo $14$.`],
      solution: [
        { title: 'Résolution', latex: latex`On obtient $9k\equiv2\pmod{14}$. Comme $9\times11=99\equiv1\pmod{14}$, $k\equiv22\equiv8\pmod{14}$. Donc $t\equiv76\pmod{126}$.` },
        { title: 'Vérification', latex: latex`Le reste de $76$ vaut $4$ modulo $9$ et $6$ modulo $14$. Comme les deux modules sont premiers entre eux, deux solutions diffèrent d’un multiple de $126$. Le plus petit entier positif est $76$.` },
      ],
    },
    {
      ref: 'NEX-STR-05', title: 'Un générateur explicite dans un anneau de polynômes', difficulty: 3,
      statement: latex`Dans $\mathbb R[X]$, soit $I=(X^3-1)\mathbb R[X]+(X^2-1)\mathbb R[X]$. Déterminer un générateur unitaire de $I$. En déduire une condition simple d’appartenance à $I$.`,
      hints: [latex`Les deux polynômes ont la racine $1$.`, latex`Soustraire $X(X^2-1)$ à $X^3-1$.`],
      solution: [
        { title: 'Divisibilité', latex: latex`Chaque générateur est divisible par $X-1$, donc $I\subset(X-1)\mathbb R[X]$.` },
        { title: 'Identité et appartenance', latex: latex`On calcule $(X^3-1)-X(X^2-1)=X-1$. Le membre de gauche appartient à $I$, qui contient donc tous les multiples de $X-1$. Finalement $P\in I$ équivaut à $P(1)=0$.` },
      ],
    },
    {
      ref: 'NEX-STR-06', title: 'Unités d’une algèbre triangulaire simple', difficulty: 3,
      statement: latex`On fixe $N=\begin{pmatrix}0&1\\0&0\end{pmatrix}$ et $\mathcal A=\{aI+bN\mid a,b\in\mathbb R\}$. Vérifier que cet ensemble est une sous-algèbre de $M_2(\mathbb R)$. Déterminer ses unités et leurs inverses.`,
      hints: [latex`Développer le produit de deux éléments en utilisant $N^2=0$.`, latex`Comparer les coefficients de $I$ et de $N$ dans un produit égal à $I$.`],
      solution: [
        { title: 'Stabilité', latex: latex`L’ensemble est le sous-espace engendré par $I$ et $N$. Le produit $(aI+bN)(cI+dN)=acI+(ad+bc)N$ appartient encore à cet ensemble. Comme $I$ y appartient, il s’agit d’une sous-algèbre unitaire.` },
        { title: 'Unités', latex: latex`Un inverse exige $ac=1$, donc $a\ne0$. Dans ce cas $c=1/a$ et $d=-b/a^2$ annulent le coefficient de $N$. Le calcul donne l’inverse dans les deux ordres.` },
      ],
    },
  ],
  quiz: [
    { question: latex`Quand la classe de $a$ est-elle inversible modulo $n$ ?`, answers: [latex`$n\mid a$`, latex`$\gcd(a,n)=1$`, latex`$a\ne0$ toujours`], correct: 1, explanation: 'Le critère suit directement de Bézout.' },
    { question: 'Quel noyau caractérise un morphisme injectif ?', answers: ['Le seul neutre', 'Toute la source', 'Toute l’arrivée'], correct: 0, explanation: 'Une égalité d’images ramène le quotient des deux éléments au noyau.' },
    { question: latex`Résoudre $6x\equiv9\pmod{12}$ est-il possible ?`, answers: ['Toujours', 'Non', 'Seulement pour les impairs'], correct: 1, explanation: latex`Le PGCD de $6$ et $12$ vaut $6$, qui ne divise pas $9$.` },
  ],
}
