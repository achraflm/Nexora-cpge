import { latex, type CourseContent } from './format'

export const logique: CourseContent = {
  slug: 'elements-logique', subject: 'MATH', level: 'SUP', title: 'Éléments de logique', domain: 'Raisonnement',
  summary: 'Traduire et nier des assertions, distinguer les sens d’une implication et rédiger une preuve directe, par contraposée, par l’absurde ou par récurrence.',
  minutes: 150,
  sections: [
    { title: 'Objectifs et prérequis', latex: latex`Ce chapitre fournit le vocabulaire utilisé dans le reste du programme. On part de propriétés connues sur les entiers et les réels. Pour chaque énoncé, repérer d’abord le domaine des variables, puis les hypothèses et la conclusion. Une preuve est un enchaînement d’assertions justifiées à partir de ces hypothèses.` },
    { title: 'Assertions et connecteurs', latex: latex`Une assertion a une valeur de vérité dans le contexte choisi. Une phrase contenant une variable libre devient une assertion une fois cette variable fixée ou quantifiée. Par exemple, $n^2>4$ est faux pour $n=1$ et vrai pour $n=3$. Sur un même domaine, $P\land Q$ exige les deux conditions. $P\lor Q$ est vrai dès qu’une condition est vraie, y compris lorsque les deux le sont.`
    },
    { title: 'Négation et lois de De Morgan', latex: latex`Nier une assertion revient à décrire exactement les situations où elle échoue. La négation de « les deux conditions sont vraies » est « au moins une est fausse ». La négation de « au moins une est vraie » est « les deux sont fausses ».

$$ \neg(P\land Q)\iff(\neg P\lor\neg Q),\qquad
\neg(P\lor Q)\iff(\neg P\land\neg Q). $$

Pour une inégalité, garder l’égalité du bon côté : $\neg(x<3)$ signifie $x\ge3$. La négation de $2<x\le5$ est $x\le2$ ou $x>5$.` },
    { title: 'Implication et équivalence', latex: latex`L’implication $P\Rightarrow Q$ échoue seulement si $P$ est vraie et $Q$ fausse. $P$ est une condition suffisante pour $Q$ et $Q$ une condition nécessaire pour $P$. Si $P$ est fausse, l’implication ne donne pas la valeur de vérité de $Q$.

$$ (P\Rightarrow Q)\iff(\neg P\lor Q),\qquad
\neg(P\Rightarrow Q)\iff(P\land\neg Q). $$

La réciproque est $Q\Rightarrow P$. Pour obtenir une équivalence, démontrer les deux sens séparément ou vérifier que chaque transformation est réversible. De $a^2=b^2$, on ne peut passer à $a=b$ qu’avec une hypothèse adaptée, par exemple $a,b\ge0$.` },
    { title: 'Contraposée et contre-exemple', latex: latex`La contraposée $\neg Q\Rightarrow\neg P$ est logiquement équivalente à $P\Rightarrow Q$. Elle peut faciliter la preuve lorsque nier la conclusion donne une hypothèse calculable. Par exemple, un entier impair s’écrit $2k+1$ et son carré est impair. Cela démontre par contraposée que si $n^2$ est pair alors $n$ est pair.

Pour réfuter $\forall x\in E,\ P(x)\Rightarrow Q(x)$, il faut produire un $x$ appartenant à $E$ pour lequel $P$ est vraie et $Q$ fausse. Un cas où l’hypothèse est fausse ne sert pas de contre-exemple.` },
    { title: 'Quantificateurs et dépendances', latex: latex`Le quantificateur $\forall$ impose de prendre un élément arbitraire du domaine. Le quantificateur $\exists$ exige un témoin. Dans $\forall x\in E,\exists y\in F,\ R(x,y)$, le témoin peut dépendre de $x$. En inversant les quantificateurs, on demande un même témoin pour tous les $x$.

$$ \neg(\forall x\in E,\ P(x))\iff\exists x\in E,\ \neg P(x). $$
$$ \neg(\exists x\in E,\ P(x))\iff\forall x\in E,\ \neg P(x). $$

Pour nier plusieurs quantificateurs imbriqués, les échanger successivement tout en gardant leur ordre, puis nier la propriété. Écrire $\exists!$ revient à prouver l’existence puis à montrer que deux témoins éventuels coïncident.` },
    { title: 'Preuve directe, cas et absurde', latex: latex`En preuve directe, partir de l’hypothèse et utiliser des résultats déjà établis jusqu’à la conclusion. Dans une preuve par cas, vérifier que les cas couvrent le domaine et démontrer le résultat dans chacun. La parité d’un entier est un découpage exhaustif, comme le signe d’un réel quand on distingue les possibilités $x<0$, $x=0$ et $x>0$.

Un raisonnement par l’absurde ajoute la négation de ce qu’on veut prouver et aboutit à une contradiction explicite. Pour démontrer une implication par l’absurde, on conserve $P$ et on suppose $\neg Q$. Par exemple, si $a>0$, $b>0$ et $a+b\le0$, alors $a\le-b<0$, ce qui contredit $a>0$.` },
    { title: 'Récurrence simple et forte', latex: latex`Pour prouver $P(n)$ à partir de $n_0$, vérifier $P(n_0)$ puis démontrer, pour un $n\ge n_0$ arbitraire, que $P(n)$ entraîne $P(n+1)$. La propriété $P(n)$ est l’hypothèse temporaire de l’hérédité. Elle ne peut pas être remplacée par $P(n+1)$.

En récurrence forte, on utilise toutes les propriétés $P(k)$ pour $n_0\le k\le n$. Elle est adaptée à un problème où plusieurs tailles inférieures interviennent. Si une relation utilise les deux indices précédents, il faut deux valeurs initiales, ou un énoncé de récurrence portant sur un couple.` },
    { title: 'Exemple rédigé pour le CNC', latex: latex`Montrons que $1+3+\cdots+(2n-1)=n^2$ pour $n\ge1$. Au rang $1$, les deux membres valent $1$. Supposons l’égalité au rang $n$. La somme au rang suivant s’obtient en ajoutant $2n+1$, donc elle vaut $n^2+2n+1=(n+1)^2$. Le principe de récurrence s’applique.

Quand une somme ou une suite est en jeu, écrire le premier rang, isoler le nouveau terme, puis identifier explicitement la partie où intervient l’hypothèse de récurrence.` },
    { title: 'Erreurs classiques', latex: latex`Éviter d’inverser une implication sans preuve. Ne pas choisir un $y$ qui dépend de $x$ lorsqu’il doit fonctionner pour tous les $x$. Ne pas prouver une propriété universelle par une liste d’exemples. Dans une preuve d’existence, vérifier que le témoin respecte toutes les contraintes du domaine. Dans une preuve par l’absurde, nommer précisément les deux assertions incompatibles.` },
    { title: 'Fiche de révision', latex: latex`Réécrire l’assertion avec ses domaines. Si elle est fausse, chercher un témoin de la négation. Si elle est vraie, choisir la méthode qui exploite le mieux les données : preuve directe, étude de cas, contraposée, absurde ou récurrence. Relire chaque changement de sens et chaque utilisation d’un quantificateur.` },
  ],
  exercises: [
    {
      ref: 'NEX-LOG-01', title: 'Décrire le rejet par les deux tests', difficulty: 1,
      statement: latex`Un entier $n$ est accepté si $n$ est multiple de $3$ et si $-4<n\le8$. Écrire, avec « et » et « ou », la condition exacte de rejet. Donner un entier rejeté pour chacune des deux causes prises séparément.`,
      hints: [latex`Nier d’abord la conjonction.`, latex`Nier séparément l’appartenance à l’intervalle et la divisibilité.`],
      solution: [
        { title: 'Négation', latex: latex`Le rejet signifie que $n$ n’est pas multiple de $3$, ou que $n\le-4$, ou que $n>8$. Les bornes viennent de la négation de $-4<n\le8$.` },
        { title: 'Témoins', latex: latex`Le nombre $7$ est dans l’intervalle mais n’est pas multiple de $3$. Le nombre $9$ est multiple de $3$ mais est hors de l’intervalle. Ces deux entiers isolent les deux causes.` },
      ],
    },
    {
      ref: 'NEX-LOG-02', title: 'Témoin individuel ou coefficient commun', difficulty: 1,
      statement: latex`Dans $E=\{1,2,4\}$, étudier les deux assertions $\forall x\in E,\exists y\in\mathbb R,\ xy=2$ et $\exists y\in\mathbb R,\forall x\in E,\ xy=2$. Écrire la négation de la seconde.`,
      hints: [latex`Résoudre $xy=2$ pour un $x$ fixé.`, latex`Dans la seconde assertion, comparer les contraintes des éléments $1$ et $2$.`],
      solution: [
        { title: 'Première assertion', latex: latex`Pour chaque $x\in E$, le réel $y=2/x$ convient. Le témoin dépend de $x$, ce que l’ordre des quantificateurs permet.` },
        { title: 'Seconde assertion', latex: latex`Il faudrait simultanément $y=2$ pour $x=1$ et $y=1$ pour $x=2$. La négation est donc vraie : pour tout $y\in\mathbb R$, il existe $x\in E$ tel que $xy\ne2$.` },
      ],
    },
    {
      ref: 'NEX-LOG-03', title: 'Un reste qui interdit une divisibilité', difficulty: 2,
      statement: latex`Montrer que pour tout entier $n$, si $5$ divise $n^2-1$, alors $5$ ne divise pas $n$. Énoncer la réciproque et décider si elle est vraie.`,
      hints: [latex`Si $n=5k$, que vaut $n^2-1$ modulo $5$ ?`, latex`Pour tester la réciproque, essayer les petits entiers non multiples de $5$.`],
      solution: [
        { title: 'Contraposée', latex: latex`Si $5$ divise $n$, alors $n^2-1\equiv-1\pmod5$, donc cette expression n’est pas divisible par $5$. C’est la contraposée recherchée.` },
        { title: 'Réciproque', latex: latex`Elle affirmerait que tout entier non divisible par $5$ vérifie $5\mid(n^2-1)$. Pour $n=2$, on a $n^2-1=3$. La réciproque est fausse.` },
      ],
    },
    {
      ref: 'NEX-LOG-04', title: 'Un maximum obtenu en un seul point', difficulty: 2,
      statement: latex`Montrer qu’il existe un unique $x\in\mathbb R$ tel que $3x-x^2\ge9/4$. Identifier ce réel. Utiliser ensuite le même calcul pour déterminer les $x$ tels que $3x-x^2\ge2$.`,
      hints: [latex`Compléter le carré.`, latex`Un carré est nul en un unique point. Pour un seuil plus petit, résoudre une inégalité avec valeur absolue.`],
      solution: [
        { title: 'Existence et unicité', latex: latex`On a $3x-x^2=9/4-(x-3/2)^2$. Atteindre au moins $9/4$ force le carré à valoir zéro. Le réel $3/2$ convient et il est unique.` },
        { title: 'Second seuil', latex: latex`Le carré doit être au plus $1/4$, soit $|x-3/2|\le1/2$. On obtient le segment $[1,2]$, bornes incluses.` },
      ],
    },
    {
      ref: 'NEX-LOG-05', title: 'Une suite entière toujours multiple de sept', difficulty: 2,
      statement: latex`On pose $u_n=8^n-1$ pour $n\in\mathbb N$. Démontrer par récurrence que $7\mid u_n$. Donner ensuite une preuve à partir d’une somme géométrique.`,
      hints: [latex`Commencer au rang $0$.`, latex`Écrire $u_{n+1}$ comme un multiple de $u_n$ plus une constante.`, latex`Factoriser $8^n-1$ par $8-1$ lorsque $n\ge1$.`],
      solution: [
        { title: 'Récurrence', latex: latex`Au rang zéro, $u_0=0$. Si $u_n=7k$, alors $u_{n+1}=8u_n+7=7(8k+1)$. La propriété est héréditaire.` },
        { title: 'Somme géométrique', latex: latex`Pour $n\ge1$, $8^n-1=7(1+8+\cdots+8^{n-1})$. Le second facteur est entier. Le rang zéro se vérifie directement.` },
      ],
    },
    {
      ref: 'NEX-LOG-06', title: 'Constituer un montant avec deux types de jetons', difficulty: 3,
      statement: latex`On dispose de jetons de valeur $4$ et $7$ en quantité illimitée. Montrer que tout entier $n\ge18$ est réalisable. Donner un exemple de montant inférieur à $18$ impossible à former.`,
      hints: [latex`Chercher des représentations de quatre entiers consécutifs.`, latex`Une fois $n-4$ réalisé, ajouter un seul jeton de valeur $4$.`, latex`Pour tester $17$, examiner les valeurs possibles du nombre de jetons de valeur $7$.`],
      solution: [
        { title: 'Quatre bases', latex: latex`On réalise $18=7+7+4$, $19=7+4+4+4$, $20=5\times4$ et $21=3\times7$. Ces quatre cas couvrent les quatre classes modulo $4$.` },
        { title: 'Hérédité forte', latex: latex`Pour $n\ge22$, l’entier $n-4$ appartient à $[18,n-1]$. Par l’hypothèse de récurrence forte, il est réalisable. L’ajout d’un jeton de valeur $4$ donne $n$.` },
        { title: 'Montant impossible', latex: latex`Pour former $17$, on pourrait prendre zéro, un ou deux jetons de valeur $7$. Les restes seraient $17$, $10$ ou $3$, aucun ne pouvant être obtenu uniquement avec des jetons de valeur $4$.` },
      ],
    },
  ],
  quiz: [
    { question: latex`Quand $P\Rightarrow Q$ est-elle fausse ?`, answers: ['Hypothèse vraie et conclusion fausse', 'Hypothèse fausse et conclusion vraie', 'Hypothèse et conclusion fausses'], correct: 0, explanation: 'Pour réfuter l’implication, il faut respecter l’hypothèse et invalider la conclusion.' },
    { question: latex`Quelle est la négation de $\forall x\in E,\exists y\in F,\ R(x,y)$ ?`, answers: [latex`$\forall x,\forall y,\neg R(x,y)$`, latex`$\exists x,\forall y,\neg R(x,y)$`, latex`$\exists y,\forall x,\neg R(x,y)$`], correct: 1, explanation: 'Échanger chaque quantificateur avec son dual tout en gardant l’ordre.' },
    { question: 'La récurrence utilise les deux rangs précédents. Que faut-il dans l’initialisation ?', answers: ['Deux rangs consécutifs', 'Uniquement un rang choisi au hasard', 'Aucun rang'], correct: 0, explanation: 'Il faut assez de valeurs de départ pour enclencher la règle au premier rang où elle s’applique.' },
  ],
}
