import { latex, type CourseContent } from './format'

export const topologie: CourseContent = {
  slug: 'topologie-espaces-normes', subject: 'MATH', level: 'SPE', title: 'Topologie des espaces normés', domain: 'Analyse',
  summary: 'Comparer des normes, étudier les limites et la continuité, caractériser les parties compactes et construire des chemins.',
  minutes: 280,
  sections: [
    { title: 'Normes, distances et boules', latex: latex`Une norme $N$ vérifie $N(x)\ge0$, $N(x)=0\Leftrightarrow x=0$, $N(\lambda x)=|\lambda|N(x)$ et $N(x+y)\le N(x)+N(y)$. La distance associée est $d(x,y)=N(x-y)$. L’inégalité triangulaire appliquée dans les deux sens donne $|N(x)-N(y)|\le N(x-y)$.

Pour $r>0$, la boule ouverte $B(a,r)$ est définie par $N(x-a)<r$, la boule fermée par $N(x-a)\le r$ et la sphère par $N(x-a)=r$. Les boules sont convexes : pour $0\le t\le1$, la norme en $(1-t)x+ty-a$ est majorée par la combinaison des normes des deux écarts à $a$. Dans le plan, les boules unité de $\|\cdot\|_1$, $\|\cdot\|_2$ et $\|\cdot\|_\infty$ ont respectivement la forme d’un losange, d’un disque et d’un carré. Une partie est bornée si elle est contenue dans une boule de rayon fini.` },
    { title: 'Normes usuelles et normes produits', latex: latex`Pour $x\in\mathbb K^n$, les expressions usuelles sont $\|x\|_1=\sum_j|x_j|$, $\|x\|_2=(\sum_j|x_j|^2)^{1/2}$ et $\|x\|_\infty=\max_j|x_j|$. La norme $2$ provient du produit scalaire usuel, dont l’inégalité de Cauchy–Schwarz entraîne l’inégalité triangulaire. Sur un produit fini d’espaces normés, le maximum des normes des composantes est une norme.

Sur les suites bornées, on peut prendre le supremum des modules des termes. Pour les fonctions continues sur un segment non réduit à un point, les normes usuelles incluent le maximum de $|f|$, l’intégrale de $|f|$ et la racine de l’intégrale de $|f|^2$. Pour ces deux dernières, une valeur non nulle de $f$ impose une contribution positive près du point considéré, par continuité.

Pour une matrice $A=(a_{ij})$, la norme $1$ est le maximum des sommes des modules par colonne, la norme infinie le maximum des sommes des modules par ligne, et la norme de Frobenius la racine de la somme des carrés des modules. Les deux premières correspondent aux normes d’opérateur subordonnées à la norme $1$ et à la norme infinie, respectivement. La norme de Frobenius est la norme euclidienne des coefficients.` },
    { title: 'Suites et valeurs d’adhérence', latex: latex`La convergence $x_n\to a$ signifie $\|x_n-a\|\to0$. La distance entre deux limites possibles est bornée par la somme de leurs distances à $x_n$, ce qui donne l’unicité. Une suite convergente est bornée. Avec la norme maximum sur un produit fini, la convergence équivaut à la convergence de chaque composante.

Les opérations linéaires conservent la convergence. Par exemple, si $x_n\to x$ et $y_n\to y$, l’inégalité triangulaire donne $\|(x_n+y_n)-(x+y)\|\le\|x_n-x\|+\|y_n-y\|\to0$.

Une valeur d’adhérence est une limite d’une sous-suite. Par exemple, $x_n=((-1)^n,1/(n+1))$ possède deux valeurs d’adhérence, $(1,0)$ et $(-1,0)$. Chaque valeur est obtenue en choisissant une parité fixe, et toute sous-suite convergente doit fixer la parité à partir d’un certain rang. Pour une suite non bornée ayant une seule valeur d’adhérence, prendre $x_{2n}=0$ et $x_{2n+1}=n$.` },
    { title: 'Comparer les normes', latex: latex`Deux normes $N_1,N_2$ sont équivalentes s’il existe $a,b>0$ tels que $aN_1\le N_2\le bN_1$ sur tout l’espace. Les constantes sont indépendantes du vecteur. Les inégalités donnent des inclusions de boules, donc les mêmes ouverts et les mêmes suites convergentes. Sur $\mathbb K^n$, on a par exemple
$$ \|x\|_\infty\le\|x\|_2\le\sqrt n\,\|x\|_\infty. $$
Pour réfuter une minoration $aN_1\le N_2$, chercher une suite de $N_1$-norme égale à $1$ et de $N_2$-norme tendant vers $0$. Sur les espaces de fonctions, concentrer une fonction près d’une extrémité donne souvent une telle suite.` },
    { title: 'Voisinages, ouverts et fermés', latex: latex`Une partie $U$ est un voisinage de $a$ si elle contient une boule ouverte centrée en $a$. Un ouvert est un voisinage de chacun de ses points. Un fermé est le complémentaire d’un ouvert ou, de façon équivalente, une partie qui contient les limites dans $E$ de toutes ses suites convergentes. Les réunions quelconques et les intersections finies d’ouverts sont ouvertes. Par passage au complémentaire, les intersections quelconques et les réunions finies de fermés sont fermées.

Sur une partie $A\subset E$, la boule relative s’obtient en intersectant la boule ambiante avec $A$. Les ouverts relatifs sont les intersections des ouverts de $E$ avec $A$. Par complémentaire dans $A$, on obtient la même description pour les fermés relatifs. Ainsi $[0,1[$ est ouvert dans $[0,2]$, car $[0,1[=]-1,1[\cap[0,2]$.` },
    { title: 'Intérieur, adhérence et densité', latex: latex`L’intérieur $A^\circ$ est le plus grand ouvert inclus dans $A$. L’adhérence $\overline A$ est le plus petit fermé contenant $A$. Un point est dans $\overline A$ si chaque boule centrée en ce point rencontre $A$, ou s’il est limite d’une suite de points de $A$. Pour passer de la première condition à la seconde, choisir un point de $A$ dans la boule de rayon $1/n$.

La frontière est $\partial A=\overline A\setminus A^\circ$. Ainsi chaque boule centrée en un point de la frontière rencontre $A$ et son complémentaire. Une partie $D$ est dense dans $E$ si $\overline D=E$. Deux applications continues qui coïncident sur $D$ coïncident sur $E$, en prenant des limites de suites de points de $D$.` },
    { title: 'Limites et continuité', latex: latex`Pour $f:A\to F$ et $a\in\overline A$, la limite $f(x)\to L$ quand $x\to a$ dans $A$ signifie que pour tout $\varepsilon>0$ il existe $\delta>0$ tel que $\|f(x)-L\|<\varepsilon$ pour tout $x\in A$ vérifiant $\|x-a\|<\delta$. Cela équivaut à $f(x_n)\to L$ pour toute suite $x_n\in A$ tendant vers $a$. Si $a\in A$, la continuité en $a$ correspond à $L=f(a)$. Pour une limite en l’infini, on remplace la proximité de $a$ par la condition $\|x\|>R$ pour un rayon $R$ suffisamment grand.

Les restrictions, compositions et combinaisons usuelles de fonctions continues s’étudient à l’aide des règles sur les limites. L’image réciproque d’un ouvert par une application continue est un ouvert relatif de son domaine, et celle d’un fermé est un fermé relatif. Ainsi si $g$ est continue à valeurs réelles, $\{x:g(x)>0\}$ est ouvert et $\{x:g(x)\le0\}$ est fermé dans le domaine de $g$.` },
    { title: 'Uniformité et fonctions lipschitziennes', latex: latex`La continuité uniforme demande un même $\delta$ pour tous les points du domaine, pour un $\varepsilon$ donné. Une majoration $\|f(x)-f(y)\|\le L\|x-y\|$ avec une constante $L$ entraîne cette propriété. La fonction $t\mapsto t^2$ est $2M$-lipschitzienne sur $[-M,M]$ pour $M>0$. Sur $\mathbb R$, les couples $(n,n+1/n)$ deviennent arbitrairement proches alors que la différence de leurs carrés tend vers $2$.

Si $B$ est non vide, $d(x,B)=\inf_{b\in B}\|x-b\|$ est $1$-lipschitzienne. Pour tout $b\in B$, majorer $\|x-b\|$ par $\|x-y\|+\|y-b\|$, prendre l’infimum sur $b$ et échanger $x$ avec $y$. Les zéros de cette fonction forment $\overline B$.` },
    { title: 'Continuité linéaire et norme d’opérateur', latex: latex`Une application linéaire $u:E\to F$ est continue si et seulement si $\|u(x)\|\le C\|x\|$ pour une constante $C$ et tout $x$. Une borne obtenue près de $0$ se ramène à cette forme par homogénéité. Pour une application multilinéaire, le critère correspondant est une majoration par $C$ fois le produit des normes des variables.

La plus petite constante admissible pour $u$ est sa norme d’opérateur $\|u\|_{\mathrm{op}}$, égale au supremum de $\|u(x)\|/\|x\|$ pour $x\ne0$. En appliquant successivement les deux bornes, on obtient $\|v\circ u\|_{\mathrm{op}}\le\|v\|_{\mathrm{op}}\|u\|_{\mathrm{op}}$. Pour calculer exactement une norme, établir une majoration puis trouver un vecteur ou une suite de vecteurs qui l’atteint ou s’en approche.` },
    { title: 'Compacité et existence d’extrema', latex: latex`Dans un espace normé, une partie $K$ est compacte si toute suite de points de $K$ admet une sous-suite qui converge vers un point de $K$. Une partie compacte est fermée et bornée. Un fermé relatif d’un compact est compact. Un produit fini de compacts est compact, car on peut extraire successivement une sous-suite convergente pour chaque coordonnée.

L’image continue d’un compact est compacte. Sur un compact non vide, une fonction continue réelle atteint son minimum et son maximum. Le théorème de Heine assure aussi la continuité uniforme sur le compact. Pour chercher un minimum sur un domaine non borné, on peut restreindre la recherche à un compact contenant tous les points dont la valeur est au plus celle d’un point d’essai.

Une suite de points d’un compact ayant une seule valeur d’adhérence converge vers elle. Sinon une sous-suite resterait à distance positive de cette valeur et, par compacité, admettrait une autre valeur d’adhérence.` },
    { title: 'Connexité par arcs', latex: latex`Un chemin dans $A$ joignant $a$ à $b$ est une application continue $\gamma:[0,1]\to A$ avec $\gamma(0)=a$ et $\gamma(1)=b$. La possibilité de relier deux points définit une relation d’équivalence, car on peut renverser un chemin ou en concaténer deux. Les classes sont les composantes connexes par arcs.

Une partie convexe permet le chemin $\gamma(t)=(1-t)a+tb$. Si $A$ est étoilée par rapport à $c$, passer de $a$ à $c$ puis de $c$ à $b$. L’image d’une partie connexe par arcs par une fonction continue l’est aussi, en composant le chemin avec la fonction. Pour une fonction à valeurs réelles, cette propriété donne le théorème des valeurs intermédiaires le long de chaque chemin.` },
    { title: 'Résultats en dimension finie', latex: latex`En dimension finie, toutes les normes sont équivalentes. Pour voir le mécanisme, choisir une base et la norme maximum des coordonnées. L’inégalité triangulaire majore toute autre norme $N$ par un multiple de celle-ci. Elle donne aussi la continuité de $N$ pour cette norme de coordonnées. Sur la sphère unité des coordonnées, compacte par Bolzano–Weierstrass dans $\mathbb K^n$, $N$ atteint un minimum strictement positif. L’homogénéité donne la minoration sur l’espace entier.

Dans ce cadre, les compacts sont exactement les fermés bornés. Toute suite bornée est contenue dans une boule fermée compacte. Elle converge si et seulement si elle admet une seule valeur d’adhérence. Un sous-espace de dimension finie d’un espace normé est fermé, car une suite convergente de ses points est bornée et possède donc une sous-suite qui converge dans ce sous-espace.

Toute application linéaire définie sur un espace de dimension finie est continue. Développer sur une base et majorer par une constante fois la norme maximum des coordonnées. En dimension finie, les applications polynomiales sont continues, ainsi que les applications multilinéaires sur un produit de tels espaces.` },
    { title: 'Fiche de révision', latex: latex`Pour comparer deux normes, chercher des estimations uniformes et tester les constantes sur des suites. Pour une adhérence, construire une suite approchante. Pour un ouvert ou un fermé défini par une inégalité, chercher une fonction continue dont il est une image réciproque. Pour une existence d’extremum, établir la compacité puis utiliser la continuité. Pour une connexité par arcs, construire un chemin qui reste dans la partie à chaque instant.` },
  ],
  exercises: [
    {
      ref: 'NEX-TOP-01', title: 'Un losange incliné', difficulty: 1,
      statement: latex`Sur $\mathbb R^2$, établir que $N(x,y)=|x+2y|+|y|$ est une norme. Déterminer les meilleures constantes $a,b$ de $a\|(x,y)\|_\infty\le N(x,y)\le b\|(x,y)\|_\infty$. Décrire les quatre sommets de la boule unité fermée de $N$.`,
      hints: [latex`Écrire $(u,v)=(x+2y,y)$ et retrouver $(x,y)$ à partir de $(u,v)$.`, latex`Tester $(1,1)$ pour la grande constante et $(-2,1)$ pour la petite.`],
      solution: [
        { title: 'Norme et constantes', latex: latex`La transformation $(x,y)\mapsto(u,v)$ est linéaire et inversible. Elle transporte la norme $1$. On a $N(x,y)\le |x|+3|y|\le4\|(x,y)\|_\infty$. De même $|y|\le N$ et $|x|=|u-2v|\le2(|u|+|v|)=2N$.` },
        { title: 'Optimalité et sommets', latex: latex`Les quotients $N/\|\cdot\|_\infty$ valent $4$ en $(1,1)$ et $1/2$ en $(-2,1)$. Les meilleures constantes sont donc $a=1/2$ et $b=4$. Les sommets du losange $|u|+|v|\le1$ deviennent $(1,0)$, $(-1,0)$, $(-2,1)$ et $(2,-1)$.` },
      ],
    },
    {
      ref: 'NEX-TOP-02', title: 'Mesurer la taille d’une fonction', difficulty: 2,
      statement: latex`Sur $C([0,1],\mathbb R)$, on pose $N(f)=\int_0^1(1+t)|f(t)|\,\mathrm dt$ et $M(f)=\max_{[0,1]}|f|$. Justifier que $N$ est une norme, trouver le meilleur $b$ tel que $N\le bM$ et décider si les deux normes sont équivalentes.`,
      hints: [latex`La fonction constante $1$ permet de tester l’optimalité de la majoration.`, latex`Appliquer les deux normes aux fonctions $t\mapsto t^n$.`],
      solution: [
        { title: 'Norme et majoration', latex: latex`La positivité, l’homogénéité et la sous-additivité découlent du module et de l’intégrale. Si $f$ est non nulle, sa continuité donne un sous-intervalle de longueur positive où $|f|$ est minorée par un réel strictement positif. Comme $1+t\ge1$, on a $N(f)>0$. En intégrant $(1+t)|f(t)|\le(1+t)M(f)$, on trouve $N(f)\le3M(f)/2$, avec égalité pour la constante $1$.` },
        { title: 'Absence de minoration uniforme', latex: latex`Pour $f_n(t)=t^n$, $M(f_n)=1$ alors que $N(f_n)=1/(n+1)+1/(n+2)\to0$. Toute minoration $aM\le N$ avec $a>0$ échoue. Les deux normes ne sont donc pas équivalentes.` },
      ],
    },
    {
      ref: 'NEX-TOP-03', title: 'Au-dessus d’une parabole tronquée', difficulty: 2,
      statement: latex`Dans $\mathbb R^2$, soit $A=\{(x,y):0<x\le2,\ y>x^2\}$. Déterminer l’intérieur, l’adhérence et la frontière de $A$. Donner un exemple de point de frontière appartenant à $A$ et un autre qui lui est extérieur.`,
      hints: [latex`Les contraintes strictes définissent un ouvert. Décaler les points d’abscisse $2$ vers la droite.`, latex`Pour approcher les points où une contrainte devient une égalité, ramener d’abord l’abscisse vers $1$.`],
      solution: [
        { title: 'Intérieur', latex: latex`La partie $0<x<2$ et $y>x^2$ est ouverte par continuité des fonctions coordonnées et de $(x,y)\mapsto y-x^2$. Elle est incluse dans $A$. Quand $x=2$, chaque boule contient un point d’abscisse supérieure à $2$. L’intérieur est donc exactement cet ouvert.` },
        { title: 'Adhérence et frontière', latex: latex`Le fermé défini par $0\le x\le2$ et $y\ge x^2$ contient $A$. Pour tout point $(x,y)$ de ce fermé, poser $x_n=(1-1/n)x+1/n$ et $y_n=\max(y,x_n^2)+1/n$ pour $n\ge2$. Ces points sont dans $A$ et convergent vers $(x,y)$. On obtient ainsi l’adhérence. En retirant l’intérieur, il reste l’arc $y=x^2$ pour $0\le x\le2$ et les deux demi-droites verticales $x=0$, $y\ge0$ et $x=2$, $y\ge4$. Le point $(2,5)$ appartient à $A$ et $(1,1)$ lui est extérieur.` },
      ],
    },
    {
      ref: 'NEX-TOP-04', title: 'Une majoration matricielle atteinte', difficulty: 2,
      statement: latex`Munir $\mathbb R^3$ et $\mathbb R^2$ de la norme maximum. Calculer la norme de l’opérateur $u(x,y,z)=(2x-y+3z,-x+4y+z)$ et exhiber un vecteur unité sur lequel elle est atteinte. En déduire une constante de Lipschitz pour $u$.`,
      hints: [latex`Majorer séparément le module de chaque coordonnée de $u(x,y,z)$.`, latex`Choisir les signes de $(x,y,z)$ pour rendre positifs tous les termes dans une coordonnée.`],
      solution: [
        { title: 'Majoration uniforme', latex: latex`Avec $M=\max(|x|,|y|,|z|)$, chaque coordonnée de $u(x,y,z)$ est en module au plus $6M$, par l’inégalité triangulaire. Ainsi $\|u\|_{\mathrm{op}}\le6$.` },
        { title: 'Égalité et continuité', latex: latex`Le vecteur $(1,-1,1)$ est de norme $1$ et son image vaut $(6,-4)$. On a donc $\|u\|_{\mathrm{op}}=6$. Par linéarité, $\|u(v)-u(w)\|_\infty\le6\|v-w\|_\infty$. Le même vecteur, comparé au vecteur nul, montre que cette constante est optimale.` },
      ],
    },
    {
      ref: 'NEX-TOP-05', title: 'Un minimum sur une droite non bornée', difficulty: 3,
      statement: latex`Sur la droite $D=\{(x,y):x+2y=3\}$, on étudie $f(x,y)=(x-2)^2+3y^2$. Établir l’existence d’un minimum en se ramenant à un compact, puis calculer sa valeur et le point où il est atteint.`,
      hints: [latex`Le point $(3,0)$ donne une valeur d’essai utile.`, latex`De $f(x,y)\le1$, déduire deux bornes indépendantes sur les coordonnées.`, latex`Éliminer $x$ par l’équation de $D$ pour calculer le minimum.`],
      solution: [
        { title: 'Restriction à un compact', latex: latex`On a $f(3,0)=1$. Le sous-ensemble $K=D\cap\{f\le1\}$ est fermé par continuité des deux fonctions qui le définissent. Il est borné, car $|x-2|\le1$ et $|y|\le1/\sqrt3$. Il est donc compact et non vide. Le minimum de $f$ sur $K$ existe et vaut au plus $1$. Comme $f>1$ sur $D\setminus K$, ce minimum vaut aussi sur $D$.` },
        { title: 'Calcul et unicité', latex: latex`Avec $x=3-2y$, on obtient $f=1-4y+7y^2=7(y-2/7)^2+3/7$. Le minimum est $3/7$, uniquement pour $y=2/7$ et $x=17/7$.` },
      ],
    },
    {
      ref: 'NEX-TOP-06', title: 'Deux domaines séparés par les axes', difficulty: 3,
      statement: latex`Dans le plan, étudier les composantes connexes par arcs de $A=\{(x,y):xy>1\}$. Montrer aussi que $B=\{(x,y):xy<1\}$ est connexe par arcs, en donnant un chemin qui joint deux points quelconques de $B$.`,
      hints: [latex`Sur un chemin dans $A$, l’abscisse ne peut pas changer de signe.`, latex`Dans le quadrant positif, joindre les deux points à celui dont les coordonnées sont leurs maxima.`, latex`Pour $B$, examiner le produit des coordonnées sur un segment issu de l’origine.`],
      solution: [
        { title: 'Composantes de A', latex: latex`L’abscisse est continue le long d’un chemin et l’égalité $x=0$ est impossible dans $A$. Il faut donc rester dans le même quadrant. Pour deux points du quadrant positif, soit $P$ le point défini par les maxima coordonnée par coordonnée. Chaque segment reliant l’un des points à $P$ a des coordonnées positives qui ne diminuent pas en avançant vers $P$. Le produit reste supérieur à $1$. La symétrie $(x,y)\mapsto(-x,-y)$ donne des chemins dans le quadrant négatif. Ces deux parties sont donc exactement les deux composantes.` },
        { title: 'Chemins dans B', latex: latex`Pour $(x,y)\in B$ et $0\le t\le1$, le produit des coordonnées de $(tx,ty)$ est $t^2xy<1$. Si $xy\le0$, il reste non positif. Si $0<xy<1$, il est au plus $xy$. Le segment vers l’origine reste dans $B$. Deux points se joignent donc par concaténation de leurs deux segments vers l’origine.` },
      ],
    },
  ],
  quiz: [
    { question: 'Dans un espace normé quelconque, quelle implication est toujours vraie ?', answers: ['Une partie fermée est compacte', 'Une partie fermée et bornée est compacte', 'Une partie compacte est fermée et bornée'], correct: 2, explanation: 'La réciproque pour les parties fermées et bornées vaut en dimension finie.' },
    { question: latex`Quelle est l’adhérence de $]0,1[$ dans $\mathbb R$ ?`, answers: [latex`$[0,1]$`, latex`$]0,1[$`, latex`$\{0,1\}$`], correct: 0, explanation: 'Les deux extrémités sont limites de suites de points de l’intervalle ouvert.' },
    { question: latex`Quel objet définit la norme subordonnée d’un opérateur linéaire continu $u$ ?`, answers: [latex`Le supremum de $\|u(x)\|$ sur tout $E$`, latex`Le supremum de $\|u(x)\|$ pour $\|x\|\le1$`, latex`La norme de $u(0)$`], correct: 1, explanation: 'L’homogénéité permet de prendre le supremum sur la boule unité.' },
  ],
}
