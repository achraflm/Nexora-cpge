import { latex, type CourseContent } from './format'

const complexUrl = 'https://math.libretexts.org/Bookshelves/Linear_Algebra/A_First_Course_in_Linear_Algebra_(Kuttler)/06:_Complex_Numbers'
const reductionUrl = 'https://math.libretexts.org/Bookshelves/Linear_Algebra/A_First_Course_in_Linear_Algebra_(Kuttler)/07%253A_Spectral_Theory/7.02%253A_Diagonalization'
const book = { book: 'A First Course in Linear Algebra', author: 'Ken Kuttler (Lyryx)', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/' } as const

export const maths: CourseContent[] = [
  {
    slug: 'nombres-complexes', subject: 'MATH', level: 'SUP', title: 'Nombres complexes', domain: 'Algèbre',
    summary: 'Passer de la forme algébrique à la forme polaire, résoudre des équations dans le plan complexe et interpréter les résultats géométriquement.',
    minutes: 95, legacyId: 'maths-sup-complexes', source: { ...book, url: complexUrl },
    sections: [
      { title: 'Objectifs et prérequis', latex: latex`On utilisera la trigonométrie du cercle, le calcul algébrique et les équations du second degré. La forme algébrique facilite les sommes et les quotients. La forme polaire révèle les angles, les puissances et les racines.` },
      { title: 'Définition et représentation', latex: latex`Tout complexe s’écrit de manière unique $z=a+ib$, où $a,b\in\mathbb R$ et $i^2=-1$. Son affixe représente le point $(a,b)$. Les composantes de la somme s’additionnent. En développant le produit, le terme $ib\cdot id$ devient $-bd$.

$$ (a+ib)(c+id)=(ac-bd)+i(ad+bc). $$

La différence de deux affixes représente le vecteur allant du second point au premier. Une translation d’affixe $b$ envoie $z$ sur $z+b$.` },
      { title: 'Conjugaison, module et quotient', latex: latex`Le conjugué $\bar z=a-ib$ correspond au symétrique par rapport à l’axe réel. Le module $|z|=\sqrt{a^2+b^2}$ représente la distance à l’origine. Le calcul $z\bar z=|z|^2$ fournit un dénominateur réel quand $z\ne0$.

$$ z^{-1}=\frac{\bar z}{|z|^2},\quad |zw|=|z||w|,\quad |z+w|\le |z|+|w|. $$

Pour l’inégalité, développer $|z+w|^2$ et majorer $\operatorname{Re}(z\bar w)$ par $|z\bar w|$. Dans un quotient, conjuguer le dénominateur en multipliant aussi le numérateur.` },
      { title: 'Argument et forme exponentielle', latex: latex`Pour $z\ne0$, le point $z/|z|$ est sur le cercle unité. Si $\theta$ est un angle qui le repère, alors $z=r(\cos\theta+i\sin\theta)=re^{i\theta}$ avec $r=|z|>0$. Les angles admissibles diffèrent d’un multiple de $2\pi$. L’origine n’a pas d’argument.

$$ re^{i\theta}\,\rho e^{i\phi}=r\rho e^{i(\theta+\phi)},\qquad \overline{re^{i\theta}}=re^{-i\theta}. $$

Les formules d’addition de sinus et de cosinus donnent la première identité en développant le produit. Pour un argument, relever le quadrant avant d’employer une fonction tangente inverse.` },
      { title: 'De Moivre et racines', latex: latex`Par récurrence à partir de la loi de multiplication, $(re^{i\theta})^n=r^ne^{in\theta}$ pour $n\ge0$. Pour les entiers négatifs, on applique le même raisonnement à l’inverse si $r>0$.

Pour résoudre $w^n=z\ne0$, comparer les modules, puis les angles modulo $2\pi$. Les racines suivantes sont distinctes et forment un polygone régulier. Pour $z=0$, la seule racine est $0$.

$$ w_k=r^{1/n}e^{i(\theta+2k\pi)/n},\qquad k=0,\ldots,n-1. $$` },
      { title: 'Équations quadratiques', latex: latex`Compléter le carré transforme $az^2+bz+c=0$, avec $a\ne0$, en $(2az+b)^2=b^2-4ac$. Trouver les deux racines carrées de ce discriminant, ou la racine nulle lorsqu’il vaut zéro.

$$ z=\frac{-b\pm\delta}{2a},\qquad \delta^2=b^2-4ac. $$

Pour un discriminant complexe $x+iy$, on peut aussi poser $\delta=u+iv$ et résoudre $u^2-v^2=x$, $2uv=y$, $u^2+v^2=\sqrt{x^2+y^2}$. Le signe du produit $uv$ est imposé par $y$.` },
      { title: 'Géométrie et réflexes CNC', latex: latex`Le nombre $re^{i\theta}$ multiplie les distances à l’origine par $r$ et ajoute $\theta$ aux arguments. En se plaçant au centre $a$, une similitude directe s’écrit $z\mapsto a+re^{i\theta}(z-a)$. Un quotient d’affixes de vecteurs non nuls donne à la fois un rapport de longueurs et un angle orienté.

Exemple. Le coefficient $1+i$ produit une rotation de $\pi/4$ et une dilatation de rapport $\sqrt2$. Pour une équation en $w^n$, vérifier le nombre de solutions et les substituer avant de conclure.` },
      { title: 'Fiche de révision', latex: latex`Pour une somme, développer en parties réelle et imaginaire. Pour une division, multiplier par le conjugué du dénominateur. Pour une puissance ou une racine, passer au module et à l’argument. En géométrie, former la différence des affixes avant d’en prendre le module ou l’argument.` },
    ],
    exercises: [
      {
        ref: 'KUT-SUP-06-01', title: 'Trois quotients complexes', locator: '§ 6.1, exemple 3', url: 'https://math.libretexts.org/Bookshelves/Linear_Algebra/A_First_Course_in_Linear_Algebra_(Kuttler)/06%253A_Complex_Numbers/6.01%253A_Complex_Numbers', difficulty: 1,
        statement: latex`Écrire les trois quotients sous la forme $a+ib$, avec $a,b\in\mathbb R$.

$$ \frac{1}{i},\qquad \frac{2-i}{3+4i},\qquad \frac{1-2i}{-2+5i}. $$`,
        hints: [latex`Pour chaque dénominateur $w$, calculer son conjugué $\bar w$.`, latex`Le produit $w\bar w$ est réel. Multiplier haut et bas du quotient par $\bar w$.`, latex`Développer les numérateurs en utilisant $i^2=-1$ puis séparer les composantes.`],
        solution: [
          { title: 'Premier quotient', latex: latex`Comme $i(-i)=1$, l’inverse de $i$ est $-i$.` },
          { title: 'Deuxième quotient', latex: latex`Avec $\overline{3+4i}=3-4i$, le dénominateur vaut $25$. Le numérateur est $(2-i)(3-4i)=2-11i$.
$$ \frac{2-i}{3+4i}=\frac2{25}-\frac{11}{25}i. $$` },
          { title: 'Troisième quotient', latex: latex`Le dénominateur devient $4+25=29$. Le numérateur $(1-2i)(-2-5i)$ vaut $-12-i$.
$$ \frac{1-2i}{-2+5i}=-\frac{12}{29}-\frac1{29}i. $$` },
        ],
      },
      {
        ref: 'KUT-SUP-06-02', title: 'Factoriser à partir des racines cubiques', locator: '§ 6.3, exemple 2', url: complexUrl + '/6.03:_Roots_of_Complex_Numbers', difficulty: 2,
        statement: latex`Résoudre dans $\mathbb C$ l’équation $w^3=27$. Donner les solutions en forme polaire et algébrique, puis factoriser $X^3-27$ sur $\mathbb C$ et sur $\mathbb R$.`,
        hints: [latex`Comparer d’abord les modules des deux membres.`, latex`Résoudre $3\theta\equiv0\pmod{2\pi}$ avant de choisir les angles distincts.`, latex`Revenir à la forme algébrique avec $\cos(2\pi/3)$ et $\sin(2\pi/3)$.`],
        solution: [
          { title: 'Module et arguments', latex: latex`Le module est la solution positive de $r^3=27$, donc $r=3$. Les angles $\theta$ vérifient $3\theta\in2\pi\mathbb Z$. On prend $0$, $2\pi/3$ et $4\pi/3$ modulo $2\pi$.` },
          { title: 'Coordonnées et interprétation', latex: latex`Les trois points ont le même module et sont espacés angulairement de $2\pi/3$. Ils forment un triangle équilatéral centré à l’origine.
$$ \left\{3,\ -\frac32+i\frac{3\sqrt3}{2},\ -\frac32-i\frac{3\sqrt3}{2}\right\}. $$` },
          { title: 'Factorisations', latex: latex`Sur $\mathbb C$, prendre le produit des trois facteurs $X-w_k$ associés aux racines. Sur $\mathbb R$, regrouper les deux facteurs conjugués. La somme de ces racines vaut $-3$ et leur produit vaut $9$.
$$ X^3-27=(X-3)(X^2+3X+9). $$` },
        ],
      },
    ],
    quiz: [
      { question: latex`Quel est le module de $3-4i$ ?`, answers: ['5', '7', '25'], correct: 0, explanation: latex`Le module vaut $\sqrt{3^2+(-4)^2}=5$.` },
      { question: latex`Combien de racines sixièmes distinctes possède $z\ne0$ ?`, answers: ['3', '6', '12'], correct: 1, explanation: 'Les six angles diffèrent d’un multiple du sixième de tour.' },
    ],
  },
  {
    slug: 'reduction-endomorphismes', subject: 'MATH', level: 'SPE', title: 'Réduction des endomorphismes', domain: 'Algèbre linéaire',
    summary: 'Exploiter les sous-espaces propres et les polynômes annulateurs pour décider de la diagonalisabilité, construire une base adaptée et calculer des puissances.',
    minutes: 120, legacyId: 'maths-reduc', source: { ...book, url: reductionUrl },
    sections: [
      { title: 'Objectifs et prérequis', latex: latex`On travaille sur un espace de dimension finie sur $\mathbb R$ ou $\mathbb C$. Revoir la résolution de systèmes, le déterminant et les matrices de changement de base. Le choix du corps peut changer la réponse.` },
      { title: 'Éléments propres', latex: latex`Un vecteur propre de $A$ est un vecteur $v\ne0$ tel que $Av=\lambda v$. Le sous-espace propre associé à $\lambda$ est $E_\lambda=\ker(A-\lambda I)$. La somme des sous-espaces propres de valeurs distinctes est directe.

Pour le montrer, supposer $\sum_j v_j=0$ avec $v_j\in E_{\lambda_j}$. Appliquer le produit des $A-\lambda_j I$ en omettant un seul indice $k$. Il reste un scalaire non nul multipliant $v_k$.` },
      { title: 'Polynôme caractéristique et multiplicités', latex: latex`Les valeurs propres sont les racines dans le corps de base de $\chi_A(X)=\det(XI-A)$. La multiplicité algébrique est l’ordre de la racine. Compléter une base de $E_\lambda$ en une base de tout l’espace donne un bloc diagonal $\lambda I$ suivi d’un bloc complémentaire. On en déduit que $\dim E_\lambda$ ne dépasse pas la multiplicité algébrique.

Le coefficient de $X^{n-1}$ vaut $-\operatorname{tr}A$ et le coefficient constant vaut $(-1)^n\det A$. Ces contrôles détectent des erreurs de calcul.` },
      { title: 'Diagonalisation et construction d’une base', latex: latex`La matrice $A$ est diagonalisable si elle admet une base de vecteurs propres. Écrire cette base en colonnes dans $P$ et placer les valeurs propres dans le même ordre dans $D$.

$$ AP=PD\quad\Longleftrightarrow\quad P^{-1}AP=D. $$

La première égalité se vérifie colonne par colonne. Si le polynôme caractéristique est scindé, comparer la somme des dimensions des noyaux à $n$. Si le spectre contient $n$ valeurs distinctes, la somme a déjà dimension $n$.` },
      { title: 'Polynômes annulateurs', latex: latex`Cayley–Hamilton donne $\chi_A(A)=0$. Un polynôme annulateur est un polynôme $Q$ tel que $Q(A)=0$. Si $Q$ est scindé à racines simples, les polynômes de Lagrange $L_j$ de ses racines vérifient $\sum_j L_j=1$ et $(X-\lambda_j)L_j$ est divisible par $Q$. Ainsi $v=\sum_j L_j(A)v$ décompose tout vecteur en vecteurs des sous-espaces propres.

Réciproquement, le produit des $X-\lambda$ sur les valeurs propres distinctes annule toute matrice diagonalisable. Une matrice réelle telle que $A^2=-I$ peut être diagonalisable sur $\mathbb C$, alors que son spectre réel est vide.` },
      { title: 'Trigonalisation', latex: latex`Un polynôme caractéristique scindé assure la trigonalisation. Choisir un vecteur propre, le compléter en une base, puis procéder par récurrence sur le bloc de taille $n-1$. Une base triangulaire ne donne pas nécessairement une base de vecteurs propres. Une matrice triangulaire livre les valeurs propres sur sa diagonale.` },
      { title: 'Exemple et méthode CNC', latex: latex`Si $A^2=3A-2I$, le polynôme $(X-1)(X-2)$ permet de conclure sans déterminant. Les projecteurs sur les deux sous-espaces sont $2I-A$ et $A-I$. Pour $k\ge0$, on obtient directement
$$ A^k=(2I-A)+2^k(A-I). $$
En général, utiliser $A^k=PD^kP^{-1}$ seulement après avoir vérifié que $P$ est inversible. En présence d’une racine multiple, calculer le noyau plutôt que d’aligner plusieurs copies du même vecteur.` },
      { title: 'Fiche de révision', latex: latex`Préciser le corps, calculer ou reconnaître le spectre, obtenir les noyaux, puis compter leurs dimensions. Si un polynôme annulateur simple est déjà donné, exploiter cette information avant de calculer un déterminant. Vérifier $AP=PD$ et l’ordre des colonnes.` },
    ],
    exercises: [
      {
        ref: 'KUT-SPE-07-01', title: 'Diagonalisation avec une valeur propre double', locator: '§ 7.2, exemple 1', url: reductionUrl, difficulty: 3,
        statement: latex`Pour la matrice ci-dessous, trouver une matrice inversible $P$ et une matrice diagonale $D$ telles que $P^{-1}AP=D$.
$$ A=\begin{pmatrix}2&0&0\\1&4&-1\\-2&-4&4\end{pmatrix}. $$`,
        hints: [latex`Développer $\det(XI-A)$ suivant la première ligne.`, latex`Pour $\lambda=2$, ramener les conditions sur $(x,y,z)$ à une relation indépendante.`, latex`Écrire les deux vecteurs de $E_2$ suivis d’un vecteur non nul de $E_6$.`],
        solution: [
          { title: 'Spectre', latex: latex`Le développement suivant la première ligne donne $(X-2)((X-4)^2-4)=(X-2)^2(X-6)$.` },
          { title: 'Calcul des noyaux', latex: latex`Pour $\lambda=2$, les équations se réduisent à $x+2y-z=0$. Les vecteurs $(-2,1,0)$ et $(1,0,1)$ forment une base de ce plan. Pour $\lambda=6$, on trouve $x=0$ et $z=-2y$, donc $(0,1,-2)$ engendre la droite propre.` },
          { title: 'Changement de base', latex: latex`Les trois vecteurs forment une base puisque le plan propre et la droite propre sont en somme directe. On vérifie la relation $AP=PD$ sur les trois colonnes.
$$ P=\begin{pmatrix}-2&1&0\\1&0&1\\0&1&-2\end{pmatrix},\qquad D=\operatorname{diag}(2,2,6). $$` },
        ],
      },
      {
        ref: 'KUT-SPE-07-02', title: 'Obstruction à la diagonalisation', locator: '§ 7.2, exemple 2', url: reductionUrl, difficulty: 2,
        statement: latex`Déterminer si $A=\begin{pmatrix}1&1\\0&1\end{pmatrix}$ est diagonalisable. Justifier la conclusion en calculant le sous-espace propre.`,
        hints: [latex`Sur une matrice triangulaire, lire les valeurs propres sur la diagonale.`, latex`Écrire explicitement $(A-I)(x,y)^\top$.`],
        solution: [
          { title: 'Multiplicité et noyau', latex: latex`Le polynôme caractéristique est $(X-1)^2$. On a $(A-I)(x,y)^\top=(y,0)^\top$. Ainsi $E_1=\operatorname{Vect}((1,0)^\top)$.` },
          { title: 'Conclusion', latex: latex`La seule valeur propre fournit une droite. Deux vecteurs propres ne peuvent donc constituer une base de dimension deux. La matrice est triangulaire mais non diagonalisable.` },
        ],
      },
    ],
    quiz: [
      { question: latex`Une matrice $3\times3$ a trois valeurs propres distinctes dans le corps de base. Que conclure ?`, answers: ['Elle est diagonalisable', 'Elle est singulière', 'Elle est scalaire'], correct: 0, explanation: 'Les trois sous-espaces propres apportent chacun au moins un vecteur indépendant.' },
      { question: latex`Si $\chi_A=(X-2)^2$ et $\dim E_2=1$, que conclure ?`, answers: ['Deux bases propres existent', 'La diagonalisation est impossible', 'Le déterminant est nul'], correct: 1, explanation: 'Une seule direction propre est disponible pour une dimension totale de deux.' },
    ],
  },
]
