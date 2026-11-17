import { latex, type CourseContent } from './format'

type Enrichment = Pick<CourseContent, 'sections' | 'exercises'>

export const mathsApprofondissement: Record<string, Enrichment> = {
  'nombres-complexes': {
    sections: [
      { title: 'Distances, médiatrices et cercles', latex: latex`Pour des points d’affixes $a$ et $z$, la distance vaut $|z-a|$. L’équation $|z-a|=R$, avec $R>0$, définit un cercle. Si $a\ne b$, l’équation $|z-a|=|z-b|$ définit la médiatrice du segment d’extrémités $a,b$. En élevant au carré, les termes $|z|^2$ disparaissent et il reste une équation affine.

Pour reconnaître une droite par deux points $a\ne b$, utiliser $(z-a)/(b-a)\in\mathbb R$. L’angle entre deux vecteurs non nuls d’affixes $u,v$ est l’argument de $v/u$ modulo $2\pi$. Pour conclure à l’orthogonalité, vérifier que la partie réelle du quotient est nulle.` },
      { title: 'Racines de l’unité et sommes géométriques', latex: latex`Les solutions de $z^n=1$ sont les puissances de $\omega=e^{2i\pi/n}$. Le produit de deux racines reste une racine et l’inverse de $\omega^k$ est $\omega^{-k}$. Si $n\ge2$, alors $\omega\ne1$ et
$$ (1-\omega)(1+\omega+\cdots+\omega^{n-1})=1-\omega^n=0. $$
Le centre de gravité des sommets est donc l’origine. Plus généralement, si $\omega^m\ne1$, la somme des $(\omega^m)^k$ pour $0\le k<n$ est nulle ; si $\omega^m=1$, elle vaut $n$. La distinction évite de diviser par zéro.` },
      { title: 'Trigonométrie par calcul complexe', latex: latex`Utiliser $\cos t=(e^{it}+e^{-it})/2$ et $\sin t=(e^{it}-e^{-it})/(2i)$. Développer une puissance, puis regrouper les termes dont les exposants sont opposés. Par exemple,
$$ \cos^3t=\frac{\cos(3t)+3\cos t}{4}. $$
À l’inverse, pour exprimer $\cos(3t)$ en fonction de $\cos t$, prendre la partie réelle de $(\cos t+i\sin t)^3$ et éliminer $\sin^2t$ par $1-\cos^2t$. Le choix de la méthode dépend du sens de la transformation demandé.` },
      { title: 'Fixer le centre d’une similitude', latex: latex`Une transformation $z\mapsto az+b$ avec $a\ne0$ a pour rapport $|a|$ et angle $\arg a$. Si $a\ne1$, son unique point fixe est $c=b/(1-a)$ et la transformation s’écrit $z'-c=a(z-c)$. Si $a=1$, on obtient une translation, avec tous les points fixes si $b=0$ et aucun sinon.

Calculer le coefficient de deux transformations composées avant de chercher leur centre. Une rotation après une translation n’a pas, en général, le même centre que la composition dans l’ordre opposé.` },
    ],
    exercises: [
      {
        ref: 'NEX-CPL-03', title: 'Calculer des racines carrées sans trigonométrie', difficulty: 2,
        statement: latex`Déterminer tous les $z\in\mathbb C$ tels que $z^2=5-12i$ en posant $z=x+iy$. Vérifier le résultat par développement.`,
        hints: [latex`Comparer les parties réelle et imaginaire.`, latex`La relation des modules donne $x^2+y^2=13$.`],
        solution: [
          { title: 'Système réel', latex: latex`On obtient $x^2-y^2=5$ et $2xy=-12$. Comme $|z^2|=|z|^2=13$, on en déduit $x^2=9$ et $y^2=4$.` },
          { title: 'Signes et vérification', latex: latex`Le produit $xy$ est négatif. Les solutions sont $3-2i$ et $-3+2i$. Le carré de chacune vaut $9-4-12i=5-12i$.` },
        ],
      },
      {
        ref: 'NEX-CPL-04', title: 'Un carré à partir d’une équation quartique', difficulty: 2,
        statement: latex`Résoudre $z^4=-16$. Identifier le polygone formé par les solutions et calculer son aire dans le plan muni d’un repère orthonormé.`,
        hints: [latex`Choisir $\pi$ comme argument de $-16$.`, latex`Les diagonales du polygone passent-elles par l’origine ?`],
        solution: [
          { title: 'Racines', latex: latex`Le module vaut $2$. Les arguments sont $\pi/4+k\pi/2$ pour $k=0,1,2,3$. Les points sont régulièrement espacés sur le cercle de rayon $2$.` },
          { title: 'Aire', latex: latex`Le polygone est un carré. Ses diagonales sont deux diamètres perpendiculaires de longueur $4$. Son aire vaut $4\times4/2=8$.` },
        ],
      },
      {
        ref: 'NEX-CPL-05', title: 'Équidistance de deux repères complexes', difficulty: 2,
        statement: latex`Décrire les points $z=x+iy$ tels que $|z-(2+i)|=|z-(-2+3i)|$. Déterminer l’intersection du lieu avec l’axe réel et confirmer géométriquement son orientation.`,
        hints: [latex`Élever au carré les deux modules.`, latex`Identifier le milieu et le vecteur reliant les deux repères.`],
        solution: [
          { title: 'Équation du lieu', latex: latex`L’égalité devient $(x-2)^2+(y-1)^2=(x+2)^2+(y-3)^2$. Après simplification, $-8x+4y-8=0$, donc $y=2x+2$. L’intersection avec l’axe réel est $(-1,0)$.` },
          { title: 'Contrôle géométrique', latex: latex`Le milieu est $(0,2)$, point de la droite. Le vecteur reliant les repères vaut $(-4,2)$ et son produit scalaire avec $(1,2)$ est nul. C’est bien la médiatrice.` },
        ],
      },
      {
        ref: 'NEX-CPL-06', title: 'Centre d’une composition de similitudes', difficulty: 3,
        statement: latex`Soient $S(z)=iz+2-i$ et $T(z)=2z-1+i$. Calculer $T\circ S$, puis donner son centre, son rapport et son angle orienté.`,
        hints: [latex`Remplacer $z$ par $S(z)$ dans l’expression de $T$.`, latex`Le centre est l’unique point fixe de la composée.`],
        solution: [
          { title: 'Composée et point fixe', latex: latex`On obtient $(T\circ S)(z)=2iz+3-i$. Le point fixe vérifie $(1-2i)z=3-i$, soit $z=1+i$ en utilisant le conjugué du dénominateur.` },
          { title: 'Interprétation', latex: latex`En notant $c=1+i$, l’égalité $(T\circ S)(z)-c=2i(z-c)$ identifie une similitude de rapport $2$ et d’angle $\pi/2$ modulo $2\pi$.` },
        ],
      },
    ],
  },
  'reduction-endomorphismes': {
    sections: [
      { title: 'Polynôme minimal et information spectrale', latex: latex`L’ensemble des polynômes qui annulent $A$ est un idéal de $\mathbb K[X]$, non nul par Cayley–Hamilton. Son générateur unitaire est le polynôme minimal $\mu_A$. Il divise chaque polynôme annulateur, donc $\chi_A$. Pour une valeur propre $\lambda$ et un vecteur propre $v\ne0$, $Q(A)v=Q(\lambda)v$. Toute valeur propre est donc racine de $\mu_A$.

Un bon polynôme annulateur suffit pour obtenir de l’information. Quand $A^2=I$, le polynôme $X^2-1$ donne une diagonalisation sur $\mathbb R$ et $\mathbb C$. La caractéristique permet de compter les multiplicités si elles sont nécessaires.` },
      { title: 'Projecteurs spectraux et puissances', latex: latex`Si $\lambda_1,\ldots,\lambda_r$ sont les valeurs propres d’une matrice diagonalisable, les polynômes de Lagrange donnent
$$ P_j=\prod_{k\ne j}\frac{A-\lambda_k I}{\lambda_j-\lambda_k},\qquad
A^n=\sum_{j=1}^r\lambda_j^nP_j\quad(n\ge1). $$
Sur $E_{\lambda_j}$, $P_j$ agit comme l’identité. Sur les autres espaces propres, il agit comme zéro. On obtient $\sum_jP_j=I$ et $P_iP_j=0$ pour $i\ne j$. Pour $n=0$, utiliser directement $A^0=I$. Si une valeur propre est nulle, les puissances négatives sont exclues.` },
      { title: 'Sous-espaces stables et commutation', latex: latex`Si $AB=BA$, alors $B$ préserve chaque espace propre de $A$ : pour $v\in E_\lambda$, $A(Bv)=B(Av)=\lambda Bv$. Si $A$ est diagonalisable à spectre simple, chaque espace propre est une droite. Une matrice qui commute avec $A$ est alors diagonale dans la même base. Avec des valeurs répétées, il reste des blocs de taille supérieure à un.

Pour résoudre $AX=XA$, changer de base une seule fois, résoudre l’équation avec une matrice diagonale ou par blocs, puis revenir à la base initiale si nécessaire.` },
      { title: 'Puissances, récurrences et partie nilpotente', latex: latex`Pour $u_{n+1}=Au_n$, la solution est $u_n=A^nu_0$. En base propre, chaque coordonnée évolue comme une suite géométrique. Si la matrice est seulement triangulaire, une valeur propre répétée peut faire apparaître un facteur polynomial en $n$. Par exemple, si $A=\lambda I+N$ avec $N^2=0$, alors pour $\lambda\ne0$
$$ A^n=\lambda^n I+n\lambda^{n-1}N\qquad(n\ge1). $$
Le binôme est valable ici parce que $\lambda I$ commute avec $N$. Contrôler la formule au premier rang avant de l’utiliser pour une limite.` },
    ],
    exercises: [
      {
        ref: 'NEX-RED-03', title: 'Une matrice triangulaire sans base propre', difficulty: 2,
        statement: latex`Soit $A=\begin{pmatrix}4&2&0\\0&4&0\\0&0&-1\end{pmatrix}$. Donner les valeurs propres et une base de chacun des espaces propres. Décider si $A$ est diagonalisable et calculer son polynôme minimal.`,
        hints: [latex`Lire les valeurs propres sur la diagonale.`, latex`Sur le sous-espace des deux premières coordonnées, $A-4I$ est non nul mais son carré est nul.`],
        solution: [
          { title: 'Dimensions', latex: latex`On a $\chi_A=(X-4)^2(X+1)$. Dans $\ker(A-4I)$, la seconde et la troisième coordonnées sont nulles. Dans $\ker(A+I)$, seules les troisièmes coordonnées sont libres. On obtient deux droites propres, insuffisantes en dimension trois.` },
          { title: 'Polynôme minimal', latex: latex`Le premier bloc exige le facteur $(X-4)^2$ et le dernier bloc exige $X+1$. Ces facteurs sont premiers entre eux. Leur produit, qui annule les deux blocs, est le polynôme minimal.` },
        ],
      },
      {
        ref: 'NEX-RED-04', title: 'Calculer des puissances sur deux directions stables', difficulty: 2,
        statement: latex`Pour $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$, déterminer une base propre et calculer $A^n$ pour $n\ge0$ dans la base canonique.`,
        hints: [latex`Tester les directions de coordonnées égales et opposées.`, latex`Décomposer tout vecteur en somme des deux directions propres.`],
        solution: [
          { title: 'Directions propres', latex: latex`Les vecteurs $(1,1)$ et $(1,-1)$ sont propres, pour $3$ et $1$. Ils sont indépendants. Un vecteur $(x,y)$ s’écrit $(x+y)(1,1)/2+(x-y)(1,-1)/2$.` },
          { title: 'Puissance', latex: latex`La première composante propre est multipliée par $3^n$, la seconde par $1$. En appliquant la formule aux deux vecteurs de la base canonique, on obtient
$$ A^n=\frac12\begin{pmatrix}3^n+1&3^n-1\\3^n-1&3^n+1\end{pmatrix}. $$` },
        ],
      },
      {
        ref: 'NEX-RED-05', title: 'Réduire et inverser à l’aide d’un polynôme annulateur', difficulty: 3,
        statement: latex`On sait que $A^2=A+2I$. Montrer que $A$ est diagonalisable, donner les deux projecteurs associés aux racines du polynôme annulateur, puis calculer $A^{-1}$ sans déterminant.`,
        hints: [latex`Factoriser $X^2-X-2$.`, latex`Un polynôme affine vaut $1$ sur l’une des racines et $0$ sur l’autre.`, latex`Isoler un produit de $A$ par une expression en $A$.`],
        solution: [
          { title: 'Spectre et projecteurs', latex: latex`Le polynôme annulateur $(X-2)(X+1)$ est scindé à racines simples, donc $A$ est diagonalisable. Les projecteurs sont $(A+I)/3$ sur $E_2$ et $(2I-A)/3$ sur $E_{-1}$. Si une racine n’est pas une valeur propre, le projecteur correspondant est nul.` },
          { title: 'Inverse', latex: latex`On a $A(A-I)=2I=(A-I)A$. Ainsi $A^{-1}=(A-I)/2$.` },
        ],
      },
      {
        ref: 'NEX-RED-06', title: 'Matrices qui commutent avec une diagonale à deux blocs', difficulty: 3,
        statement: latex`Soit $D=\operatorname{diag}(2,2,-1)$. Décrire l’ensemble des matrices $X$ de taille $3$ qui vérifient $DX=XD$, puis donner sa dimension.`,
        hints: [latex`Comparer le coefficient $(i,j)$ de chaque produit.`, latex`Repérer les couples pour lesquels les coefficients diagonaux coïncident.`],
        solution: [
          { title: 'Conditions coefficient par coefficient', latex: latex`En posant $D_{ii}=d_i$, la condition devient $(d_i-d_j)x_{ij}=0$. Les coefficients reliant le bloc des deux premiers indices au troisième sont nuls.` },
          { title: 'Dimension', latex: latex`Le bloc de taille $2$ est arbitraire, ainsi que le coefficient $(3,3)$. On obtient quatre paramètres pour le bloc et un pour le dernier coefficient, donc une dimension égale à cinq.` },
        ],
      },
    ],
  },
}
