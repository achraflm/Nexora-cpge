import { latex, type CourseContent } from './format'

export const ensembles: CourseContent = {
  slug: 'ensembles-applications', subject: 'MATH', level: 'SUP', title: 'Ensembles et applications', domain: 'Vocabulaire ensembliste',
  summary: 'Manipuler les opérations sur les ensembles et établir les propriétés d’une application par l’étude de ses images et de ses antécédents.',
  minutes: 180,
  sections: [
    { title: 'Éléments, parties et ensemble vide', latex: latex`Écrire $x\in E$ signifie que $x$ est un élément de $E$. Écrire $A\subset E$ signifie que tout élément de $A$ appartient à $E$. Le singleton $\{x\}$ est une partie de $E$ si et seulement si $x\in E$. L’ensemble vide $\varnothing$ est une partie de tout ensemble.

L’ensemble $\mathcal P(E)$ rassemble les parties de $E$. Par exemple, pour $E=\{0,1\}$, on a $\mathcal P(E)=\{\varnothing,\{0\},\{1\},E\}$. Un ensemble fini de cardinal $n$ a $2^n$ parties : pour chaque élément, on choisit de l’inclure ou non.` },
    { title: 'Décrire un ensemble et établir une égalité', latex: latex`On peut lister ses éléments ou écrire $\{x\in E\mid P(x)\}$, où $E$ borne le domaine et $P$ précise le critère. Une égalité d’ensembles se prouve par double inclusion : fixer un élément arbitraire du premier, puis du second. Une chaîne d’équivalences sur l’appartenance prouve simultanément les deux inclusions.

Pour montrer qu’une inclusion est stricte, établir l’inclusion, puis donner un témoin qui appartient au plus grand ensemble seulement.` },
    { title: 'Réunion, intersection et différence', latex: latex`L’intersection $A\cap B$ retient les éléments communs. La réunion $A\cup B$ retient les éléments d’au moins un des deux ensembles. La différence $A\setminus B$ ne retient que les éléments de $A$ qui n’appartiennent pas à $B$. Si $A\subset E$, son complémentaire relatif à $E$ est $E\setminus A$.

La différence symétrique $A\triangle B=(A\setminus B)\cup(B\setminus A)$ exige exactement une appartenance. Attention à préciser l’ensemble de référence pour les compléments.` },
    { title: 'Calcul ensembliste et partitions', latex: latex`La distributivité $A\cap(B\cup C)=(A\cap B)\cup(A\cap C)$ s’obtient en traduisant l’appartenance en connecteurs logiques. Les deux lois de De Morgan résultent de la même méthode.
$$ (A\cup B)^c=A^c\cap B^c,\qquad (A\cap B)^c=A^c\cup B^c. $$
Une partition de $E$ est une famille de parties non vides, deux à deux disjointes, dont la réunion est $E$. Par exemple, les couples d’entiers dont la somme est paire et ceux dont la somme est impaire forment une partition de $\mathbb Z^2$.` },
    { title: 'Produit cartésien et fonctions', latex: latex`Le produit $E\times F$ est l’ensemble des couples $(x,y)$ avec $x\in E$ et $y\in F$. L’ordre des coordonnées compte. Une application $f:E\to F$ associe un unique $f(x)\in F$ à chaque $x\in E$. Une formule seule ne fixe ni le départ ni l’arrivée. Changer l’un de ces ensembles peut modifier l’injectivité ou la surjectivité.

Le graphe d’une application est $\{(x,f(x))\mid x\in E\}$. Si plusieurs expressions définissent une fonction selon des cas, vérifier leur compatibilité lorsque les cas se chevauchent.` },
    { title: 'Images directes et réciproques', latex: latex`Pour $A\subset E$, l’image directe est $f(A)=\{f(x)\mid x\in A\}$. Pour $B\subset F$, l’image réciproque est $f^{-1}(B)=\{x\in E\mid f(x)\in B\}$, y compris lorsque $f$ n’a pas d’application inverse.

L’image réciproque préserve réunions, intersections et compléments. Par exemple,
$$ x\in f^{-1}(B\cap C)\iff f(x)\in B\land f(x)\in C. $$
L’image directe préserve les réunions. On a toujours $f(A\cap A')\subset f(A)\cap f(A')$. L’inclusion peut être stricte si deux éléments différents ont la même image, un dans chaque partie.` },
    { title: 'Injection, surjection et bijection', latex: latex`Une application est injective si $f(a)=f(b)$ entraîne $a=b$. Elle est surjective sur $F$ si tout élément de $F$ a au moins un antécédent dans $E$. Elle est bijective si chaque élément de $F$ a exactement un antécédent. Pour tester les trois propriétés, résoudre $f(x)=y$ en précisant $y\in F$ et en gardant les contraintes sur $x$.

Exemple. $x\mapsto x^2$ sur $\mathbb R$ n’est pas injective et n’atteint que les réels positifs ou nuls. La restriction à $[0,+\infty[$ avec le même ensemble d’arrivée est bijective, d’inverse $y\mapsto\sqrt y$.` },
    { title: 'Composition et application réciproque', latex: latex`Pour $f:E\to F$ et $g:F\to G$, on définit $(g\circ f)(x)=g(f(x))$. Vérifier le type de chaque sortie avant de composer. La composition est associative. Elle préserve l’injectivité lorsque les deux facteurs sont injectifs, et la surjectivité lorsque les deux facteurs sont surjectifs.

Pour une bijection $f$, l’inverse $f^{-1}:F\to E$ vérifie $f^{-1}\circ f=\operatorname{id}_E$ et $f\circ f^{-1}=\operatorname{id}_F$. L’inverse d’une composition de bijections inverse leur ordre : $(g\circ f)^{-1}=f^{-1}\circ g^{-1}$.` },
    { title: 'Cardinaux finis', latex: latex`Si $A$ et $B$ sont finis, compter d’abord tous les éléments, puis enlever les éléments comptés deux fois dans le chevauchement.
$$ |A\cup B|=|A|+|B|-|A\cap B|. $$
Pour des ensembles finis de même cardinal, injection et surjection sont équivalentes : une injection fournit autant d’images distinctes qu’il y a d’éléments au départ, donc elle couvre l’arrivée. Ce raccourci n’est pas valable avec des ensembles infinis.` },
    { title: 'Méthode CNC et erreurs classiques', latex: latex`Dans une preuve d’inclusion, prendre un élément, traduire son appartenance et suivre la définition jusqu’au but. Dans un problème sur une application, écrire les ensembles au-dessus des flèches et ne jamais confondre $f(A)$ avec $f^{-1}(A)$. Pour calculer une image, établir la contrainte nécessaire sur $y$, puis construire un antécédent pour montrer qu’elle est suffisante.` },
    { title: 'Fiche de révision', latex: latex`Une égalité d’ensembles est une équivalence d’appartenance. Pour une fonction, existence d’antécédent signifie surjectivité, unicité au plus signifie injectivité. Les images réciproques respectent les opérations logiques sans exiger de bijection. Les identités de composition doivent être écrites sur leurs domaines respectifs.` },
  ],
  exercises: [
    {
      ref: 'NEX-ENS-01', title: 'Deux filtres sur un ensemble de mesures', difficulty: 1,
      statement: latex`Dans $E=\{0,1,\ldots,12\}$, soit $A$ l’ensemble des multiples de $3$ et $B$ l’ensemble des entiers strictement supérieurs à $7$. Calculer $A\cap B$, $A\triangle B$ et $E\setminus(A\cup B)$.`,
      hints: [latex`Lister séparément $A$ et $B$.`, latex`Pour la différence symétrique, retirer l’intersection de la réunion.`],
      solution: [
        { title: 'Ensembles de départ', latex: latex`On a $A=\{0,3,6,9,12\}$ et $B=\{8,9,10,11,12\}$. L’intersection vaut $\{9,12\}$.` },
        { title: 'Différence et complémentaire', latex: latex`Les éléments appartenant à un seul filtre sont $\{0,3,6,8,10,11\}$. Ceux qui n’appartiennent à aucun filtre sont $\{1,2,4,5,7\}$.` },
      ],
    },
    {
      ref: 'NEX-ENS-02', title: 'Décomposer une différence', difficulty: 1,
      statement: latex`Pour trois parties $A,B,C$ d’un même ensemble, établir $A\setminus(B\cap C)=(A\setminus B)\cup(A\setminus C)$. Décider si cette dernière réunion est toujours disjointe.`,
      hints: [latex`Traduire la différence en une appartenance et une non-appartenance.`, latex`Chercher où se situent les éléments communs aux deux termes de la réunion.`],
      solution: [
        { title: 'Équivalence', latex: latex`Être dans le membre de gauche signifie être dans $A$ et manquer au moins l’un des ensembles $B$ ou $C$. En distribuant la conjonction, on obtient l’appartenance au membre de droite.` },
        { title: 'Intersection des deux morceaux', latex: latex`Leur intersection est $A\setminus(B\cup C)$. Pour $A=\{1\}$ et $B=C=\varnothing$, ce morceau n’est pas vide. La réunion est disjointe exactement quand $A\subset B\cup C$.` },
      ],
    },
    {
      ref: 'NEX-ENS-03', title: 'Quand deux ensembles disjoints ont une image commune', difficulty: 2,
      statement: latex`Soit $f:\mathbb R\to\mathbb R$ définie par $f(x)=(x-1)^2$. Calculer $f([-1,0])$, $f([2,3])$ et $f^{-1}([1,4])$. Expliquer pourquoi l’image directe ne préserve pas ici l’intersection.`,
      hints: [latex`Repérer la symétrie par rapport à $x=1$.`, latex`Pour l’image réciproque, écrire $1\le|x-1|\le2$.`],
      solution: [
        { title: 'Images directes', latex: latex`Sur $[-1,0]$, $|x-1|$ parcourt $[1,2]$ en décroissant ; sur $[2,3]$, il parcourt le même segment en croissant. Les deux images valent donc $[1,4]$.` },
        { title: 'Antécédents', latex: latex`L’inégalité sur la valeur absolue donne $[-1,0]\cup[2,3]$. Les deux segments de départ sont disjoints, leur intersection a une image vide, tandis que l’intersection des images vaut $[1,4]$.` },
      ],
    },
    {
      ref: 'NEX-ENS-04', title: 'Une fraction rationnelle et sa réciproque', difficulty: 3,
      statement: latex`On pose $f(x)=(2x+3)/(x-4)$ sur $E=\mathbb R\setminus\{4\}$. Trouver son image et montrer que $f$ est bijective entre $E$ et cette image. Donner l’application réciproque.`,
      hints: [latex`Quel réel $y$ rend le coefficient de $x$ nul dans $y(x-4)=2x+3$ ?`, latex`Vérifier que la solution obtenue n’est jamais égale à $4$.`],
      solution: [
        { title: 'Valeur exclue', latex: latex`Si $y=2$, l’équation donne $-8=3$, impossible. Pour $y\ne2$, elle équivaut à $(y-2)x=4y+3$.` },
        { title: 'Vérification et bijection', latex: latex`La solution unique vaut $(4y+3)/(y-2)$. Son écart à $4$ est $11/(y-2)$, non nul. Tout $y\ne2$ a donc un unique antécédent admissible. L’image est $\mathbb R\setminus\{2\}$ et la fraction calculée donne l’inverse.` },
      ],
    },
    {
      ref: 'NEX-ENS-05', title: 'Ce qu’une composition injective impose', difficulty: 3,
      statement: latex`Soient $f:E\to F$ et $g:F\to G$. Montrer que si $g\circ f$ est injective, alors $f$ est injective. Déterminer si $g$ est nécessairement injective. Étudier aussi le cas où $g\circ f$ est surjective.`,
      hints: [latex`Partir de $f(a)=f(b)$ et appliquer $g$.`, latex`Une composition ne teste $g$ que sur $f(E)$.`, latex`Pour la surjectivité, regarder dans quel ensemble se trouve l’antécédent intermédiaire.`],
      solution: [
        { title: 'Injection', latex: latex`Si $f(a)=f(b)$, les images composées coïncident, donc $a=b$. En revanche, prendre $E=\{0\}$, $F=\{0,1\}$, $G=\{0\}$, avec $f(0)=0$ et $g$ constante. La composition est injective mais $g$ ne l’est pas.` },
        { title: 'Surjection', latex: latex`Pour chaque $z\in G$, un antécédent par la composition produit $f(x)\in F$ tel que $g(f(x))=z$. Donc $g$ est surjective. Le contre-exemple précédent a aussi une composition surjective, alors que $f$ ne couvre pas $F$.` },
      ],
    },
    {
      ref: 'NEX-ENS-06', title: 'Reconstruire une partie à partir de deux intersections', difficulty: 3,
      statement: latex`Deux parties $A$ et $B$ vérifient $A\cup B=E$. On donne $U\subset A$ et $V\subset B$. À quelle condition existe-t-il $X\subset E$ avec $X\cap A=U$ et $X\cap B=V$ ? Déterminer toutes les solutions.`,
      hints: [latex`Sur la zone $A\cap B$, les deux prescriptions doivent coïncider.`,
        latex`Toute partie $X$ est la réunion de ses intersections avec $A$ et avec $B$.`],
      solution: [
        { title: 'Condition nécessaire et unicité', latex: latex`On doit avoir $U\cap B=V\cap A$, les deux expressions valant $X\cap A\cap B$. Comme $E=A\cup B$, on doit aussi avoir $X=(X\cap A)\cup(X\cap B)=U\cup V$.` },
        { title: 'Existence', latex: latex`Sous la condition proposée, $(U\cup V)\cap A=U\cup(V\cap A)=U$ et $(U\cup V)\cap B=V\cup(U\cap B)=V$. La partie $U\cup V$ est l’unique solution.` },
      ],
    },
  ],
  quiz: [
    { question: latex`Quelle opération est toujours préservée par une image réciproque $f^{-1}$ ?`, answers: ['Intersection', 'Aucune opération', 'Uniquement les unions disjointes'], correct: 0, explanation: 'On ramène chaque condition d’appartenance à la même image.' },
    { question: 'Une application est bijective si chaque élément de l’arrivée possède combien d’antécédents ?', answers: ['Au moins deux', 'Un seul', 'Au plus un'], correct: 1, explanation: 'Atteindre chaque élément garantit l’existence, et l’injection garantit l’unicité.' },
    { question: latex`Si $f$ et $g$ sont des bijections composables, quel est l’inverse de $g\circ f$ ?`, answers: [latex`$g^{-1}\circ f^{-1}$`, latex`$f\circ g$`, latex`$f^{-1}\circ g^{-1}$`], correct: 2, explanation: 'Les opérations s’annulent dans l’ordre inverse.' },
  ],
}
