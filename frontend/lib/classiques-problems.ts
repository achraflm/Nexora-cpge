// Grands classiques CPGE (5 en Mathématiques, 5 en Physique) intégrés à « Mes Problèmes Rédigés ».
// Thèmes choisis parmi la liste de https://elearning-cpge.com/biblio-classiques/ ;
// énoncés, indications et corrigés rédigés spécifiquement pour l'application.
import type { ProblemItem } from '@/components/ExercisePdfTemplate'

const r = String.raw

const CLASSIQUE = 'Classique incontournable — CNC / CCINP / Mines-Ponts'

export const CLASSIQUES_PROBLEMS: ProblemItem[] = [
  // ===========================================================================
  // MATHÉMATIQUES
  // ===========================================================================
  {
    id: 'classique-m1',
    code: 'CLASS-M1',
    module: 'maths',
    moduleTitle: 'Mathématiques',
    title: 'Classique — Intégrale de Gauss',
    concoursTarget: CLASSIQUE,
    filiere: 'MP / PSI / TSI',
    recommendedDuration: '1h00',
    difficulty: 3,
    tags: ['Classique', 'Intégrales à paramètre', 'Intégrales généralisées', 'Fonction Gamma'],
    totalPoints: 20,
    intro: r`On se propose de calculer $I = \int_0^{+\infty} e^{-t^2}\,dt$ à l'aide de deux fonctions auxiliaires définies sur $\mathbb{R}$ par $F(x) = \left(\int_0^x e^{-t^2}dt\right)^2$ et $G(x) = \int_0^1 \frac{e^{-x^2(1+t^2)}}{1+t^2}\,dt$.`,
    juryComments: r`La dérivation sous le signe intégrale doit être justifiée (domination locale). Le changement de variable $u = xt$ dans $G'(x)$ est l'étape clé, souvent mal rédigée.`,
    questions: [
      {
        partTitle: 'Partie I — Existence',
        items: [
          {
            qNum: '1',
            statement: r`Justifier la convergence de l'intégrale $I$.`,
            hint: r`Comparer $e^{-t^2}$ à $e^{-t}$ pour $t \ge 1$.`,
            solution: r`La fonction $t \mapsto e^{-t^2}$ est continue et positive sur $[0, +\infty[$. Pour $t \ge 1$, $t^2 \ge t$ donc $0 \le e^{-t^2} \le e^{-t}$, et $\int_1^{+\infty} e^{-t}dt$ converge. Par comparaison de fonctions positives, $I$ converge.`,
            points: 3,
          },
        ],
      },
      {
        partTitle: 'Partie II — La méthode des fonctions auxiliaires',
        items: [
          {
            qNum: '2.a',
            statement: r`Montrer que $G$ est de classe $C^1$ sur $\mathbb{R}$ et que $F' + G' = 0$.`,
            math: r`G'(x) = -2x\int_0^1 e^{-x^2(1+t^2)}\,dt`,
            hint: r`Domination sur $[-A, A]$ : $\left|\partial_x g(x,t)\right| \le 2A$. Puis poser $u = xt$.`,
            solution: r`Soit $g(x,t) = \frac{e^{-x^2(1+t^2)}}{1+t^2}$, de classe $C^1$ sur $\mathbb{R}\times[0,1]$, avec $\partial_x g(x,t) = -2x\,e^{-x^2(1+t^2)}$. Sur $[-A,A]\times[0,1]$ on a $|\partial_x g| \le 2A$, intégrable sur $[0,1]$ : $G$ est $C^1$. Pour $x > 0$, en posant $u = xt$ : $G'(x) = -2e^{-x^2}\int_0^1 x e^{-x^2t^2}dt = -2e^{-x^2}\int_0^x e^{-u^2}du$. Or $F'(x) = 2e^{-x^2}\int_0^x e^{-u^2}du$. Donc $F' + G' = 0$ sur $]0,+\infty[$ (et aussi en $0$ par continuité, les deux valant $0$).`,
            solutionMath: r`F'(x) + G'(x) = 0 \implies F(x) + G(x) = F(0) + G(0) = \frac{\pi}{4}`,
            points: 6,
          },
          {
            qNum: '2.b',
            statement: r`Calculer $F(0) + G(0)$, puis la limite de $G$ en $+\infty$. En déduire la valeur de $I$.`,
            hint: r`Majorer simplement l'intégrande de $G$ par $e^{-x^2}$.`,
            solution: r`$F(0) = 0$ et $G(0) = \int_0^1 \frac{dt}{1+t^2} = \frac{\pi}{4}$, donc $F + G = \frac{\pi}{4}$ sur $[0,+\infty[$. De plus $0 \le G(x) \le \int_0^1 e^{-x^2}dt = e^{-x^2} \to 0$. Ainsi $F(x) \to \frac{\pi}{4}$, i.e. $I^2 = \frac{\pi}{4}$, et comme $I > 0$ : $I = \frac{\sqrt{\pi}}{2}$.`,
            solutionMath: r`\int_0^{+\infty} e^{-t^2}\,dt = \frac{\sqrt{\pi}}{2}`,
            points: 6,
          },
        ],
      },
      {
        partTitle: 'Partie III — Applications',
        items: [
          {
            qNum: '3',
            statement: r`En déduire $\Gamma\!\left(\tfrac12\right) = \int_0^{+\infty} t^{-1/2}e^{-t}dt$ et, pour $a > 0$, la valeur de $\int_{-\infty}^{+\infty} e^{-a x^2}dx$.`,
            hint: r`Poser $t = u^2$, puis $u = \sqrt{a}\,x$ et utiliser la parité.`,
            solution: r`Avec $t = u^2$ ($dt = 2u\,du$) : $\Gamma(\frac12) = \int_0^{+\infty} \frac{e^{-u^2}}{u}2u\,du = 2I = \sqrt{\pi}$. Par parité puis $u = \sqrt a\,x$ : $\int_{\mathbb{R}} e^{-ax^2}dx = 2\int_0^{+\infty}e^{-ax^2}dx = \frac{2}{\sqrt a}I = \sqrt{\frac{\pi}{a}}$. C'est la normalisation de la loi normale.`,
            solutionMath: r`\Gamma\!\left(\tfrac12\right) = \sqrt{\pi}, \qquad \int_{\mathbb{R}} e^{-ax^2}dx = \sqrt{\frac{\pi}{a}}`,
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: 'classique-m2',
    code: 'CLASS-M2',
    module: 'maths',
    moduleTitle: 'Mathématiques',
    title: 'Classique — Polynômes de Tchebychev',
    concoursTarget: CLASSIQUE,
    filiere: 'MP / PSI / TSI',
    recommendedDuration: '1h30',
    difficulty: 3,
    tags: ['Classique', 'Polynômes', 'Trigonométrie', 'Produit scalaire', 'Approximation'],
    totalPoints: 20,
    intro: r`On définit la suite de polynômes $(T_n)$ par $T_0 = 1$, $T_1 = X$ et $T_{n+1} = 2XT_n - T_{n-1}$ pour $n \ge 1$. On étudie leurs propriétés trigonométriques, leurs racines, leur orthogonalité et leur propriété de minimalité en norme uniforme sur $[-1,1]$.`,
    juryComments: r`L'unicité du polynôme vérifiant $T_n(\cos\theta) = \cos(n\theta)$ (un polynôme nul sur $[-1,1]$ est nul) est souvent oubliée.`,
    questions: [
      {
        partTitle: 'Partie I — Propriétés élémentaires',
        items: [
          {
            qNum: '1.a',
            statement: r`Montrer que pour tout $n \in \mathbb{N}$ et tout $\theta \in \mathbb{R}$, $T_n(\cos\theta) = \cos(n\theta)$. Déterminer le degré et le coefficient dominant de $T_n$ ($n \ge 1$).`,
            math: r`\cos((n+1)\theta) + \cos((n-1)\theta) = 2\cos\theta\cos(n\theta)`,
            hint: 'Récurrence double à partir de la formule de trigonométrie ci-dessus.',
            solution: r`Vrai pour $n = 0, 1$. Si c'est vrai aux rangs $n-1$ et $n$, alors $T_{n+1}(\cos\theta) = 2\cos\theta\cos(n\theta) - \cos((n-1)\theta) = \cos((n+1)\theta)$. Par récurrence, $\deg T_n = n$ et le coefficient dominant est multiplié par $2$ à chaque étape à partir de $T_1$ : il vaut $2^{n-1}$ pour $n \ge 1$.`,
            points: 4,
          },
          {
            qNum: '1.b',
            statement: r`Déterminer les racines de $T_n$ ($n \ge 1$) et les points de $[-1,1]$ où $|T_n| = 1$.`,
            solution: r`$T_n(\cos\theta) = 0 \iff n\theta \equiv \frac{\pi}{2} \ [\pi]$. Les $n$ réels $x_k = \cos\frac{(2k+1)\pi}{2n}$, $0 \le k \le n-1$, sont distincts dans $]-1,1[$ : ce sont toutes les racines (degré $n$), et elles sont simples. Par ailleurs $T_n(y_k) = (-1)^k$ en $y_k = \cos\frac{k\pi}{n}$, $0 \le k \le n$ : $n+1$ points d'alternance.`,
            solutionMath: r`T_n(X) = 2^{n-1}\prod_{k=0}^{n-1}\left(X - \cos\frac{(2k+1)\pi}{2n}\right)`,
            points: 4,
          },
        ],
      },
      {
        partTitle: 'Partie II — Orthogonalité',
        items: [
          {
            qNum: '2',
            statement: r`Pour $P, Q \in \mathbb{R}[X]$, on pose $\langle P, Q\rangle = \int_{-1}^{1}\frac{P(x)Q(x)}{\sqrt{1-x^2}}dx$. Montrer qu'il s'agit d'un produit scalaire et calculer $\langle T_n, T_m\rangle$.`,
            hint: r`Changement de variable $x = \cos\theta$, $\theta \in [0, \pi]$.`,
            solution: r`L'intégrale converge (intégrande continue sur $]-1,1[$ en $O\big((1-x^2)^{-1/2}\big)$ aux bornes). Bilinéarité et symétrie sont claires ; si $\langle P,P\rangle = 0$, $P^2/\sqrt{1-x^2}$ continue positive d'intégrale nulle est nulle sur $]-1,1[$ donc $P = 0$. Avec $x = \cos\theta$ : $\langle T_n,T_m\rangle = \int_0^\pi \cos(n\theta)\cos(m\theta)d\theta$, qui vaut $0$ si $n \ne m$, $\frac{\pi}{2}$ si $n = m \ge 1$ et $\pi$ si $n = m = 0$.`,
            points: 5,
          },
        ],
      },
      {
        partTitle: 'Partie III — Minimalité uniforme',
        items: [
          {
            qNum: '3',
            statement: r`Soit $P$ un polynôme unitaire de degré $n \ge 1$. Montrer que $\sup_{[-1,1]}|P| \ge \frac{1}{2^{n-1}}$, avec égalité pour $P = \frac{T_n}{2^{n-1}}$.`,
            hint: r`Par l'absurde, étudier le signe de $Q = 2^{1-n}T_n - P$ aux points $y_k$.`,
            solution: r`Supposons $|P| < 2^{1-n}$ sur $[-1,1]$. Le polynôme $Q = 2^{1-n}T_n - P$ est de degré $\le n-1$ (termes dominants simplifiés). En $y_k = \cos\frac{k\pi}{n}$, $Q(y_k) = 2^{1-n}(-1)^k - P(y_k)$ est du signe de $(-1)^k$. $Q$ change de signe entre deux $y_k$ consécutifs : par les valeurs intermédiaires il a au moins $n$ racines, donc $Q = 0$ (degré $\le n-1$). Alors $P = 2^{1-n}T_n$ et $|P(y_0)| = 2^{1-n}$, ce qui contredit l'hypothèse stricte. L'égalité pour $2^{1-n}T_n$ vient de $|T_n| \le 1$ atteint en $1$. Application : choix optimal des nœuds d'interpolation (nœuds de Tchebychev).`,
            solutionMath: r`\min_{P \text{ unitaire}, \deg P = n}\ \|P\|_{\infty,[-1,1]} = \frac{1}{2^{n-1}}`,
            points: 7,
          },
        ],
      },
    ],
  },
  {
    id: 'classique-m3',
    code: 'CLASS-M3',
    module: 'maths',
    moduleTitle: 'Mathématiques',
    title: 'Classique — Intégrales de Wallis et formule de Stirling',
    concoursTarget: CLASSIQUE,
    filiere: 'MP / PSI / TSI',
    recommendedDuration: '1h30',
    difficulty: 4,
    tags: ['Classique', 'Suites', 'Équivalents', 'Séries télescopiques', 'Intégrales'],
    totalPoints: 20,
    intro: r`On note $W_n = \int_0^{\pi/2}\sin^n t\,dt$ (intégrales de Wallis) et l'on démontre la formule de Stirling : $n! \sim \sqrt{2\pi n}\left(\frac{n}{e}\right)^n$.`,
    juryComments: r`Pour la convergence de $\ln u_n$, un développement limité à l'ordre 2 est indispensable ; l'ordre 1 ne suffit pas à conclure.`,
    questions: [
      {
        partTitle: 'Partie I — Intégrales de Wallis',
        items: [
          {
            qNum: '1.a',
            statement: r`Montrer que $(n+2)W_{n+2} = (n+1)W_n$, puis que $(n+1)W_{n+1}W_n = \frac{\pi}{2}$ pour tout $n$.`,
            hint: r`Intégration par parties sur $\sin^{n+1}t \cdot \sin t$ ; la suite $(n+1)W_{n+1}W_n$ est constante.`,
            solution: r`En intégrant par parties : $W_{n+2} = \left[-\cos t\sin^{n+1}t\right]_0^{\pi/2} + (n+1)\int_0^{\pi/2}\cos^2 t\sin^n t\,dt = (n+1)(W_n - W_{n+2})$, d'où la relation. Alors $(n+2)W_{n+2}W_{n+1} = (n+1)W_{n+1}W_n$ : la suite est constante, égale à $W_1W_0 = 1\cdot\frac{\pi}{2}$.`,
            points: 4,
          },
          {
            qNum: '1.b',
            statement: r`En déduire que $W_n \sim \sqrt{\frac{\pi}{2n}}$, puis exprimer $W_{2n}$ à l'aide de factorielles.`,
            hint: r`$(W_n)$ est décroissante et positive : encadrer $W_{n+1}/W_n$.`,
            solution: r`$0 < W_{n+2} \le W_{n+1} \le W_n$ donne $\frac{n+1}{n+2} \le \frac{W_{n+1}}{W_n} \le 1$, donc $W_{n+1} \sim W_n$ et $nW_n^2 \sim (n+1)W_{n+1}W_n = \frac{\pi}{2}$. En itérant la relation de récurrence : $W_{2n} = \frac{(2n)!}{2^{2n}(n!)^2}\cdot\frac{\pi}{2}$.`,
            solutionMath: r`W_n \sim \sqrt{\frac{\pi}{2n}}, \qquad W_{2n} = \frac{(2n)!}{2^{2n}(n!)^2}\,\frac{\pi}{2}`,
            points: 5,
          },
        ],
      },
      {
        partTitle: 'Partie II — Formule de Stirling',
        items: [
          {
            qNum: '2.a',
            statement: r`On pose $u_n = \frac{n!\,e^n}{n^{n+1/2}}$. Montrer que $(u_n)$ converge vers un réel $K > 0$.`,
            math: r`\ln\frac{u_{n+1}}{u_n} = 1 - \left(n + \tfrac12\right)\ln\left(1 + \tfrac1n\right)`,
            hint: r`Développer à l'ordre $O(1/n^3)$ puis utiliser une série télescopique.`,
            solution: r`$\left(n+\frac12\right)\ln(1+\frac1n) = \left(n+\frac12\right)\left(\frac1n - \frac{1}{2n^2} + \frac{1}{3n^3} + O(\frac{1}{n^4})\right) = 1 + \frac{1}{12n^2} + O(\frac{1}{n^3})$. Donc $\ln u_{n+1} - \ln u_n = -\frac{1}{12n^2} + O(\frac{1}{n^3})$ est le terme général d'une série absolument convergente : $\ln u_n$ converge vers $\ell$ et $u_n \to K = e^\ell > 0$.`,
            points: 6,
          },
          {
            qNum: '2.b',
            statement: r`À l'aide de $W_{2n}$, montrer que $K = \sqrt{2\pi}$ et conclure.`,
            hint: r`Remplacer $(2n)!$ et $n!$ par leurs équivalents $K m^{m+1/2}e^{-m}$.`,
            solution: r`$(2n)! \sim K(2n)^{2n+1/2}e^{-2n}$ et $(n!)^2 \sim K^2n^{2n+1}e^{-2n}$, donc $W_{2n} \sim \frac{\pi}{2}\cdot\frac{K\,2^{2n}\sqrt{2}\,n^{2n+1/2}}{2^{2n}K^2n^{2n+1}} = \frac{\pi\sqrt2}{2K\sqrt n}$. Or $W_{2n} \sim \sqrt{\frac{\pi}{4n}} = \frac{\sqrt\pi}{2\sqrt n}$. Par unicité de la limite : $K = \sqrt{2\pi}$.`,
            solutionMath: r`n! \sim \sqrt{2\pi n}\left(\frac{n}{e}\right)^n`,
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: 'classique-m4',
    code: 'CLASS-M4',
    module: 'maths',
    moduleTitle: 'Mathématiques',
    title: "Classique — Série harmonique et constante d'Euler",
    concoursTarget: CLASSIQUE,
    filiere: 'MP / PSI / TSI',
    recommendedDuration: '1h00',
    difficulty: 2,
    tags: ['Classique', 'Suites adjacentes', 'Séries', 'Développement asymptotique'],
    totalPoints: 20,
    intro: r`On note $H_n = \sum_{k=1}^n \frac1k$ ($n \ge 1$). On établit le développement asymptotique $H_n = \ln n + \gamma + \frac{1}{2n} + o\!\left(\frac1n\right)$ où $\gamma$ est la constante d'Euler, puis on calcule la somme de la série harmonique alternée.`,
    juryComments: r`Les inégalités $\frac{x}{1+x} \le \ln(1+x) \le x$ pour $x > -1$ doivent être connues et justifiées (concavité).`,
    questions: [
      {
        partTitle: "Partie I — Existence de la constante d'Euler",
        items: [
          {
            qNum: '1',
            statement: r`On pose $u_n = H_n - \ln n$ et $v_n = H_n - \ln(n+1)$. Montrer que $(u_n)$ et $(v_n)$ sont adjacentes. On note $\gamma$ leur limite commune.`,
            math: r`\frac{x}{1+x} \le \ln(1+x) \le x \quad (x > -1)`,
            hint: r`Utiliser l'inégalité avec $x = \frac1n$ puis $x = \frac{1}{n+1}$.`,
            solution: r`$u_{n+1} - u_n = \frac{1}{n+1} - \ln(1+\frac1n) \le 0$ (car $\ln(1+\frac1n) \ge \frac{1/n}{1+1/n} = \frac{1}{n+1}$). $v_{n+1} - v_n = \frac{1}{n+1} - \ln(1+\frac{1}{n+1}) \ge 0$. Enfin $u_n - v_n = \ln(1+\frac1n) \to 0$. Les suites sont adjacentes et convergent vers $\gamma \in [v_1, u_1] = [1 - \ln 2, 1]$ (numériquement $\gamma \approx 0{,}5772$).`,
            points: 6,
          },
        ],
      },
      {
        partTitle: 'Partie II — Développement asymptotique',
        items: [
          {
            qNum: '2',
            statement: r`Montrer que $u_n - u_{n+1} \sim \frac{1}{2n^2}$, puis que $u_n - \gamma \sim \frac{1}{2n}$.`,
            hint: r`Sommer les équivalents (séries à termes positifs convergentes) et utiliser $\sum_{k \ge n}\frac1{k^2} \sim \frac1n$ (comparaison série–intégrale).`,
            solution: r`$u_n - u_{n+1} = \ln(1+\frac1n) - \frac{1}{n+1} = \left(\frac1n - \frac{1}{2n^2}\right) - \left(\frac1n - \frac1{n^2}\right) + O(\frac1{n^3}) = \frac{1}{2n^2} + O(\frac{1}{n^3})$. Par sommation des équivalents pour des séries positives convergentes : $u_n - \gamma = \sum_{k \ge n}(u_k - u_{k+1}) \sim \sum_{k\ge n}\frac{1}{2k^2} \sim \frac{1}{2n}$.`,
            solutionMath: r`H_n = \ln n + \gamma + \frac{1}{2n} + o\!\left(\frac{1}{n}\right)`,
            points: 7,
          },
        ],
      },
      {
        partTitle: 'Partie III — Application : série harmonique alternée',
        items: [
          {
            qNum: '3',
            statement: r`En exprimant $S_{2n} = \sum_{k=1}^{2n}\frac{(-1)^{k+1}}{k}$ à l'aide de $H_{2n}$ et $H_n$, montrer que $\sum_{k=1}^{+\infty}\frac{(-1)^{k+1}}{k} = \ln 2$.`,
            hint: r`Les termes pairs valent $-\frac{1}{2j}$ ; ajouter puis retrancher deux fois leur somme.`,
            solution: r`$S_{2n} = H_{2n} - 2\sum_{j=1}^n\frac{1}{2j} = H_{2n} - H_n = (\ln(2n) + \gamma + o(1)) - (\ln n + \gamma + o(1)) = \ln 2 + o(1)$. Comme $S_{2n+1} - S_{2n} = \frac{1}{2n+1} \to 0$, la série converge et sa somme vaut $\ln 2$.`,
            solutionMath: r`\sum_{k=1}^{+\infty}\frac{(-1)^{k+1}}{k} = \ln 2`,
            points: 7,
          },
        ],
      },
    ],
  },
  {
    id: 'classique-m5',
    code: 'CLASS-M5',
    module: 'maths',
    moduleTitle: 'Mathématiques',
    title: 'Classique — Matrice compagnon',
    concoursTarget: CLASSIQUE,
    filiere: 'MP / PSI',
    recommendedDuration: '1h30',
    difficulty: 3,
    tags: ['Classique', 'Réduction', 'Polynôme minimal', 'Polynôme caractéristique', 'Endomorphismes cycliques'],
    totalPoints: 20,
    intro: r`Soit $P = X^n + a_{n-1}X^{n-1} + \dots + a_1X + a_0 \in \mathbb{K}[X]$ ($n \ge 2$). Sa matrice compagnon $C_P \in \mathcal{M}_n(\mathbb{K})$ a des $1$ sur la sous-diagonale, la dernière colonne égale à $(-a_0, \dots, -a_{n-1})^T$ et des $0$ ailleurs. On note $(e_1, \dots, e_n)$ la base canonique.`,
    juryComments: r`Beaucoup de candidats calculent $\chi_{C_P}$ par un développement de déterminant fastidieux ; l'argument par vecteur cyclique est bien plus efficace.`,
    questions: [
      {
        partTitle: 'Partie I — Polynôme minimal et caractéristique',
        items: [
          {
            qNum: '1.a',
            statement: r`Calculer $C_Pe_k$ pour $1 \le k \le n$. Montrer que $P(C_P)e_1 = 0$, puis que $P(C_P) = 0$.`,
            math: r`C_Pe_k = e_{k+1}\ (k < n), \qquad C_Pe_n = -\sum_{i=0}^{n-1}a_ie_{i+1}`,
            hint: r`Remarquer que $e_{k+1} = C_P^k e_1$ et que $P(C_P)$ commute avec $C_P$.`,
            solution: r`On lit les colonnes : $C_Pe_k = e_{k+1}$ pour $k < n$ donc $e_{k+1} = C_P^ke_1$. Alors $C_P^ne_1 = C_Pe_n = -\sum_{i=0}^{n-1}a_iC_P^ie_1$, soit $P(C_P)e_1 = 0$. Pour tout $k$, $P(C_P)e_{k+1} = P(C_P)C_P^ke_1 = C_P^kP(C_P)e_1 = 0$ : $P(C_P)$ est nul sur une base, donc $P(C_P) = 0$.`,
            points: 6,
          },
          {
            qNum: '1.b',
            statement: r`En déduire que le polynôme minimal et le polynôme caractéristique de $C_P$ sont tous deux égaux à $P$.`,
            hint: r`Si $Q = \sum_{i<n} q_iX^i$ annule $C_P$, calculer $Q(C_P)e_1$.`,
            solution: r`Si $Q$ de degré $\le n-1$ annule $C_P$, alors $0 = Q(C_P)e_1 = \sum q_ie_{i+1}$, donc $Q = 0$. Ainsi $\deg\mu_{C_P} \ge n$ ; comme $\mu_{C_P}$ divise $P$ unitaire de degré $n$, $\mu_{C_P} = P$. Par Cayley-Hamilton $\mu \mid \chi$, et $\chi$ est unitaire de degré $n$ : $\chi_{C_P} = P$.`,
            solutionMath: r`\mu_{C_P} = \chi_{C_P} = P`,
            points: 6,
          },
        ],
      },
      {
        partTitle: 'Partie II — Éléments propres',
        items: [
          {
            qNum: '2',
            statement: r`Soit $\lambda$ une racine de $P$. Montrer que $V_\lambda = (1, \lambda, \dots, \lambda^{n-1})^T$ est vecteur propre de $C_P^T$. En déduire que $C_P$ est diagonalisable si et seulement si $P$ est scindé à racines simples, et donner la dimension de chaque sous-espace propre.`,
            hint: r`Les lignes de $C_P^T$ sont les colonnes de $C_P$. Utiliser $\mu_{C_P} = P$.`,
            solution: r`Pour $k < n$, la $k$-ième ligne de $C_P^T$ est $e_{k+1}^T$ : $(C_P^TV_\lambda)_k = \lambda^k = \lambda\cdot\lambda^{k-1}$. La dernière ligne donne $-\sum a_i\lambda^i = \lambda^n$ car $P(\lambda) = 0$. Donc $C_P^TV_\lambda = \lambda V_\lambda$. Une matrice est diagonalisable ssi son polynôme minimal est scindé à racines simples ; ici $\mu = P$. De plus $\text{rg}(C_P - \lambda I_n) \ge n-1$ (les $n-1$ premières colonnes sont libres), donc chaque sous-espace propre est une droite.`,
            points: 8,
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // PHYSIQUE
  // ===========================================================================
  {
    id: 'classique-p1',
    code: 'CLASS-P1',
    module: 'physique',
    moduleTitle: 'Physique & Chimie',
    title: 'Classique — Le pendule simple (linéaire et non linéaire)',
    concoursTarget: CLASSIQUE,
    filiere: 'MP / PSI / TSI',
    recommendedDuration: '1h00',
    difficulty: 2,
    tags: ['Classique', 'Mécanique', 'Oscillateur', 'Énergie', 'Anisochronisme'],
    totalPoints: 20,
    intro: r`Un point matériel $M$ de masse $m$ est suspendu à un fil inextensible de masse négligeable et de longueur $\ell$, fixé en $O$. On repère sa position par l'angle $\theta$ entre le fil et la verticale descendante. Le référentiel terrestre est galiléen, les frottements sont négligés et $g = 9{,}81\ \text{m·s}^{-2}$.`,
    juryComments: r`L'approximation des petits angles doit être explicitée ($\sin\theta \approx \theta$) et la condition de validité discutée. La formule de Borda est un attendu classique à l'oral.`,
    questions: [
      {
        partTitle: 'Partie I — Équation du mouvement',
        items: [
          {
            qNum: '1.a',
            statement: r`Établir l'équation du mouvement par le théorème du moment cinétique en $O$, puis la retrouver par conservation de l'énergie mécanique.`,
            math: r`\ddot\theta + \frac{g}{\ell}\sin\theta = 0`,
            hint: r`$L_{Oz} = m\ell^2\dot\theta$ ; la tension du fil a un moment nul en $O$.`,
            solution: r`Le moment de la tension est nul (force passant par $O$), celui du poids vaut $-mg\ell\sin\theta$. Le TMC donne $m\ell^2\ddot\theta = -mg\ell\sin\theta$. Énergie : $E_m = \frac12m\ell^2\dot\theta^2 - mg\ell\cos\theta$ est constante (tension perpendiculaire à la vitesse, ne travaille pas) ; en dérivant et en simplifiant par $\dot\theta$, on retrouve la même équation.`,
            points: 5,
          },
          {
            qNum: '1.b',
            statement: r`Dans l'approximation des petits angles, résoudre l'équation pour $\theta(0) = \theta_0$, $\dot\theta(0) = 0$. Calculer la période $T_0$ pour $\ell = 1{,}00$ m.`,
            solution: r`Avec $\sin\theta \approx \theta$ : $\ddot\theta + \omega_0^2\theta = 0$, $\omega_0 = \sqrt{g/\ell}$, d'où $\theta(t) = \theta_0\cos(\omega_0t)$. $T_0 = 2\pi\sqrt{\ell/g} = 2\pi\sqrt{1{,}00/9{,}81} \approx 2{,}01$ s, indépendante de l'amplitude (isochronisme des petites oscillations).`,
            solutionMath: r`T_0 = 2\pi\sqrt{\frac{\ell}{g}} \approx 2{,}01\ \text{s}`,
            points: 4,
          },
        ],
      },
      {
        partTitle: 'Partie II — Grandes amplitudes',
        items: [
          {
            qNum: '2.a',
            statement: r`À partir de l'intégrale première de l'énergie, exprimer la période exacte $T$ sous forme d'intégrale.`,
            hint: r`Le mouvement est symétrique : $T$ vaut 4 fois la durée pour aller de $0$ à $\theta_0$.`,
            solution: r`La conservation de l'énergie entre $\theta$ et $\theta_0$ donne $\dot\theta^2 = \frac{2g}{\ell}(\cos\theta - \cos\theta_0)$. Sur un quart de période $\dot\theta > 0$, d'où $dt = \frac{d\theta}{\sqrt{2g/\ell\,(\cos\theta - \cos\theta_0)}}$ et $T = 4\int_0^{\theta_0}\frac{d\theta}{\sqrt{\frac{2g}{\ell}(\cos\theta - \cos\theta_0)}}$ (intégrale généralisée convergente en $\theta_0$, singularité en $(\theta_0 - \theta)^{-1/2}$).`,
            solutionMath: r`T = 4\sqrt{\frac{\ell}{2g}}\int_0^{\theta_0}\frac{d\theta}{\sqrt{\cos\theta - \cos\theta_0}}`,
            points: 6,
          },
          {
            qNum: '2.b',
            statement: r`On admet la formule de Borda $T \approx T_0\left(1 + \frac{\theta_0^2}{16}\right)$. Calculer l'écart relatif pour $\theta_0 = 30°$ et commenter.`,
            solution: r`$\theta_0 = \pi/6 \approx 0{,}524$ rad, $\theta_0^2/16 \approx 0{,}017$ : $T \approx 2{,}04$ s, soit un écart relatif de $1{,}7\,\%$. La période croît avec l'amplitude : c'est l'anisochronisme dû à la non-linéarité. Pour $\theta_0 \approx 10°$ l'écart tombe à $0{,}2\,\%$, ce qui justifie l'approximation linéaire.`,
            points: 5,
          },
        ],
      },
    ],
  },
  {
    id: 'classique-p2',
    code: 'CLASS-P2',
    module: 'physique',
    moduleTitle: 'Physique & Chimie',
    title: 'Classique — Le satellite géostationnaire',
    concoursTarget: CLASSIQUE,
    filiere: 'MP / PSI / TSI',
    recommendedDuration: '1h00',
    difficulty: 2,
    tags: ['Classique', 'Mécanique céleste', 'Force centrale', 'Lois de Kepler', 'Énergie'],
    totalPoints: 20,
    intro: r`On étudie un satellite de masse $m$ en orbite autour de la Terre (centre $O$, masse $M_T$, rayon $R_T = 6\,371$ km), dans le référentiel géocentrique supposé galiléen. On donne $GM_T = 3{,}986 \times 10^{14}\ \text{m}^3\text{·s}^{-2}$ et la période de rotation propre de la Terre (jour sidéral) $T_s = 86\,164$ s.`,
    juryComments: r`Le jour sidéral (et non solaire, $86\,400$ s) doit être utilisé. La justification du plan équatorial est rarement complète.`,
    questions: [
      {
        partTitle: 'Partie I — Orbite circulaire',
        items: [
          {
            qNum: '1.a',
            statement: r`Montrer que le mouvement est plan. Pour une orbite circulaire de rayon $r$, montrer qu'elle est uniforme et exprimer la vitesse $v$ et la période $T$ (troisième loi de Kepler).`,
            math: r`v = \sqrt{\frac{GM_T}{r}}, \qquad \frac{T^2}{r^3} = \frac{4\pi^2}{GM_T}`,
            hint: 'Force centrale : conservation du moment cinétique. PFD projeté dans la base polaire.',
            solution: r`La force est centrale donc $\vec L_O = \overrightarrow{OM}\wedge m\vec v$ est constant : le mouvement est dans le plan passant par $O$ et orthogonal à $\vec L_O$. Sur un cercle, la projection orthoradiale du PFD donne $m\dot v = 0$ : mouvement uniforme. La projection radiale donne $m\frac{v^2}{r} = \frac{GM_Tm}{r^2}$, d'où $v$, puis $T = \frac{2\pi r}{v}$ fournit $T^2/r^3 = 4\pi^2/(GM_T)$.`,
            points: 6,
          },
          {
            qNum: '1.b',
            statement: r`Exprimer l'énergie mécanique $E_m$ du satellite sur une orbite circulaire en fonction de $r$.`,
            solution: r`$E_c = \frac12mv^2 = \frac{GM_Tm}{2r}$ et $E_p = -\frac{GM_Tm}{r}$, donc $E_m = -\frac{GM_Tm}{2r} = -E_c$. Monter sur une orbite plus haute demande de l'énergie, alors même que la vitesse diminue.`,
            solutionMath: r`E_m = -\frac{GM_Tm}{2r}`,
            points: 4,
          },
        ],
      },
      {
        partTitle: 'Partie II — Orbite géostationnaire',
        items: [
          {
            qNum: '2.a',
            statement: r`Justifier qu'un satellite géostationnaire est nécessairement sur une orbite circulaire équatoriale parcourue dans le sens de rotation de la Terre.`,
            solution: r`Fixe dans le référentiel terrestre, le satellite décrit un cercle centré sur l'axe des pôles, dans un plan perpendiculaire à cet axe. Or le plan de l'orbite contient $O$ : c'est donc le plan équatorial. Le rayon étant constant, l'orbite est circulaire (donc uniforme), de période $T_s$, parcourue dans le sens de rotation terrestre.`,
            points: 4,
          },
          {
            qNum: '2.b',
            statement: r`Calculer le rayon $r_G$ de l'orbite, l'altitude $h$ et la vitesse $v_G$ du satellite.`,
            solution: r`$r_G = \left(\frac{GM_TT_s^2}{4\pi^2}\right)^{1/3} = \left(\frac{3{,}986\times10^{14}\times(86\,164)^2}{4\pi^2}\right)^{1/3} \approx 4{,}22\times10^7$ m, soit $42\,160$ km. Altitude : $h = r_G - R_T \approx 35\,790$ km. Vitesse : $v_G = \sqrt{GM_T/r_G} \approx 3{,}07$ km·s$^{-1}$.`,
            solutionMath: r`r_G \approx 42\,160\ \text{km}, \quad h \approx 35\,790\ \text{km}, \quad v_G \approx 3{,}07\ \text{km·s}^{-1}`,
            points: 6,
          },
        ],
      },
    ],
  },
  {
    id: 'classique-p3',
    code: 'CLASS-P3',
    module: 'physique',
    moduleTitle: 'Physique & Chimie',
    title: 'Classique — Champ et énergie d’une sphère uniformément chargée',
    concoursTarget: CLASSIQUE,
    filiere: 'MP / PSI / TSI',
    recommendedDuration: '1h00',
    difficulty: 3,
    tags: ['Classique', 'Électrostatique', 'Théorème de Gauss', 'Potentiel', 'Énergie électrostatique'],
    totalPoints: 20,
    intro: r`Une boule de centre $O$ et de rayon $R$ porte une charge volumique uniforme $\rho > 0$ ; on note $Q = \frac43\pi R^3\rho$ sa charge totale. On travaille en coordonnées sphériques $(r, \theta, \varphi)$ de centre $O$.`,
    juryComments: r`L'étude des symétries et invariances doit précéder l'application du théorème de Gauss. La continuité du potentiel en $r = R$ fixe la constante intérieure.`,
    questions: [
      {
        partTitle: 'Partie I — Champ électrique',
        items: [
          {
            qNum: '1',
            statement: r`Par une étude des symétries et invariances, préciser la forme de $\vec E$. Calculer $\vec E$ en tout point de l'espace à l'aide du théorème de Gauss.`,
            hint: r`Surface de Gauss : sphère de centre $O$ et de rayon $r$ ; distinguer $r < R$ et $r > R$.`,
            solution: r`Tout plan contenant $O$ et $M$ est plan de symétrie : $\vec E = E(r,\theta,\varphi)\vec u_r$. L'invariance par rotation autour de $O$ donne $\vec E = E(r)\vec u_r$. Gauss sur la sphère de rayon $r$ : $4\pi r^2E(r) = Q_{\text{int}}/\varepsilon_0$. Pour $r < R$, $Q_{\text{int}} = \frac43\pi r^3\rho$ donc $E = \frac{\rho r}{3\varepsilon_0}$ ; pour $r > R$, $E = \frac{Q}{4\pi\varepsilon_0r^2}$ (comme une charge ponctuelle). $E$ est continu en $r = R$ (pas de charge surfacique).`,
            solutionMath: r`\vec E = \frac{\rho r}{3\varepsilon_0}\vec u_r \ (r < R), \qquad \vec E = \frac{Q}{4\pi\varepsilon_0r^2}\vec u_r \ (r > R)`,
            points: 7,
          },
        ],
      },
      {
        partTitle: 'Partie II — Potentiel',
        items: [
          {
            qNum: '2',
            statement: r`Calculer le potentiel $V(r)$, nul à l'infini, dans tout l'espace. Comparer $V(0)$ et $V(R)$.`,
            hint: r`$E = -\frac{dV}{dr}$ ; imposer la continuité de $V$ en $r = R$.`,
            solution: r`Pour $r > R$ : $V = \frac{Q}{4\pi\varepsilon_0r}$. Pour $r < R$ : $V = -\frac{\rho r^2}{6\varepsilon_0} + C$ ; la continuité en $R$ ($V(R) = \frac{\rho R^2}{3\varepsilon_0}$) impose $C = \frac{\rho R^2}{2\varepsilon_0}$, d'où $V(r) = \frac{\rho}{6\varepsilon_0}(3R^2 - r^2)$. Ainsi $V(0) = \frac32V(R)$ : le potentiel est maximal au centre.`,
            solutionMath: r`V(r) = \frac{\rho}{6\varepsilon_0}\left(3R^2 - r^2\right)\ (r \le R)`,
            points: 6,
          },
        ],
      },
      {
        partTitle: 'Partie III — Énergie électrostatique',
        items: [
          {
            qNum: '3',
            statement: r`À partir de la densité volumique d'énergie $\frac{\varepsilon_0E^2}{2}$, calculer l'énergie électrostatique $U$ de la distribution.`,
            solution: r`Intérieur : $\int_0^R\frac{\varepsilon_0}{2}\left(\frac{\rho r}{3\varepsilon_0}\right)^24\pi r^2dr = \frac{2\pi\rho^2R^5}{45\varepsilon_0} = \frac{Q^2}{40\pi\varepsilon_0R}$. Extérieur : $\int_R^{+\infty}\frac{\varepsilon_0}{2}\left(\frac{Q}{4\pi\varepsilon_0r^2}\right)^24\pi r^2dr = \frac{Q^2}{8\pi\varepsilon_0R}$. Total : $U = \frac{3Q^2}{20\pi\varepsilon_0R}$. On retrouve ce résultat par $U = \frac12\iiint\rho V\,d\tau$.`,
            solutionMath: r`U = \frac{3}{5}\,\frac{Q^2}{4\pi\varepsilon_0R}`,
            points: 7,
          },
        ],
      },
    ],
  },
  {
    id: 'classique-p4',
    code: 'CLASS-P4',
    module: 'physique',
    moduleTitle: 'Physique & Chimie',
    title: 'Classique — Le câble coaxial',
    concoursTarget: CLASSIQUE,
    filiere: 'MP / PSI / TSI',
    recommendedDuration: '1h30',
    difficulty: 3,
    tags: ['Classique', 'Électrostatique', 'Magnétostatique', 'Capacité', 'Inductance', 'Ligne de transmission'],
    totalPoints: 20,
    intro: r`Un câble coaxial est formé d'un conducteur cylindrique plein de rayon $a$ (âme) et d'un conducteur cylindrique creux coaxial de rayon $b > a$ (gaine), séparés par un isolant de permittivité $\varepsilon_0$ (vide) puis $\varepsilon_0\varepsilon_r$. On néglige les effets de bord (câble de grande longueur).`,
    juryComments: r`Les grandeurs linéiques (par unité de longueur) doivent être clairement distinguées des grandeurs totales. La relation $\Lambda\Gamma = 1/c^2$ est un résultat fondamental attendu.`,
    questions: [
      {
        partTitle: 'Partie I — Capacité linéique',
        items: [
          {
            qNum: '1',
            statement: r`L'âme porte la charge linéique $\lambda$ et la gaine $-\lambda$. Calculer le champ $\vec E$ entre les conducteurs, la différence de potentiel $U = V_{\text{âme}} - V_{\text{gaine}}$ et la capacité linéique $\Gamma$ (isolant : vide).`,
            hint: r`Théorème de Gauss sur un cylindre coaxial de rayon $r \in\ ]a,b[$ et de hauteur $h$.`,
            solution: r`Symétries et invariances : $\vec E = E(r)\vec u_r$. Gauss : $2\pi rhE = \lambda h/\varepsilon_0$, donc $E = \frac{\lambda}{2\pi\varepsilon_0r}$. Alors $U = \int_a^bE\,dr = \frac{\lambda}{2\pi\varepsilon_0}\ln\frac ba$ et $\Gamma = \frac{\lambda}{U}$.`,
            solutionMath: r`\Gamma = \frac{2\pi\varepsilon_0}{\ln(b/a)}`,
            points: 6,
          },
        ],
      },
      {
        partTitle: 'Partie II — Inductance linéique',
        items: [
          {
            qNum: '2',
            statement: r`L'âme est parcourue par un courant $I$ (réparti en surface, haute fréquence) et la gaine par $-I$. Calculer $\vec B$ pour $a < r < b$, puis l'inductance linéique $\Lambda$ à partir de l'énergie magnétique.`,
            hint: r`Théorème d'Ampère sur un cercle d'axe le câble ; énergie linéique $\frac12\Lambda I^2 = \iint\frac{B^2}{2\mu_0}dS$.`,
            solution: r`$\vec B = B(r)\vec u_\theta$ et Ampère donne $B = \frac{\mu_0I}{2\pi r}$ entre les conducteurs, $\vec B = \vec 0$ ailleurs. Énergie par unité de longueur : $\int_a^b\frac{1}{2\mu_0}\left(\frac{\mu_0I}{2\pi r}\right)^22\pi r\,dr = \frac{\mu_0I^2}{4\pi}\ln\frac ba = \frac12\Lambda I^2$.`,
            solutionMath: r`\Lambda = \frac{\mu_0}{2\pi}\ln\frac ba, \qquad \Lambda\,\Gamma = \mu_0\varepsilon_0 = \frac{1}{c^2}`,
            points: 7,
          },
        ],
      },
      {
        partTitle: 'Partie III — Ligne de transmission',
        items: [
          {
            qNum: '3',
            statement: r`Le câble se comporte comme une ligne sans pertes : la vitesse de propagation vaut $v = 1/\sqrt{\Lambda\Gamma}$ et l'impédance caractéristique $Z_c = \sqrt{\Lambda/\Gamma}$. Exprimer $v$ et $Z_c$ avec un isolant de permittivité relative $\varepsilon_r$, puis calculer $Z_c$ pour $b/a = 3{,}5$ et $\varepsilon_r = 2{,}25$ (polyéthylène).`,
            hint: r`Remplacer $\varepsilon_0$ par $\varepsilon_0\varepsilon_r$ ; $\frac{1}{2\pi}\sqrt{\mu_0/\varepsilon_0} \approx 60\ \Omega$.`,
            solution: r`$\Gamma = \frac{2\pi\varepsilon_0\varepsilon_r}{\ln(b/a)}$, d'où $v = \frac{c}{\sqrt{\varepsilon_r}} = 2{,}0\times10^8$ m·s$^{-1}$ et $Z_c = \frac{1}{2\pi}\sqrt{\frac{\mu_0}{\varepsilon_0\varepsilon_r}}\ln\frac ba \approx \frac{60}{1{,}5}\ln 3{,}5 \approx 50\ \Omega$ : c'est le câble standard « $50\ \Omega$ » des laboratoires.`,
            solutionMath: r`Z_c = \frac{60\ \Omega}{\sqrt{\varepsilon_r}}\ln\frac ba \approx 50\ \Omega`,
            points: 7,
          },
        ],
      },
    ],
  },
  {
    id: 'classique-p5',
    code: 'CLASS-P5',
    module: 'physique',
    moduleTitle: 'Physique & Chimie',
    title: "Classique — Fentes d'Young : interférences et diffraction",
    concoursTarget: CLASSIQUE,
    filiere: 'MP / PSI / TSI',
    recommendedDuration: '1h00',
    difficulty: 3,
    tags: ['Classique', 'Optique ondulatoire', 'Interférences', 'Diffraction', 'Différence de marche'],
    totalPoints: 20,
    intro: r`Deux fentes fines $S_1$ et $S_2$, parallèles, distantes de $a$, sont éclairées sous incidence normale par une onde plane monochromatique de longueur d'onde $\lambda$. On observe sur un écran parallèle au plan des fentes, à la distance $D$, en un point $M$ d'abscisse $x$ ($D \gg a$, $D \gg |x|$). On note $I_0$ l'intensité due à une seule fente.`,
    juryComments: r`Le calcul de la différence de marche doit être mené proprement (développement limité ou approximation des rayons parallèles). Le sens de déplacement des franges lors de l'ajout d'une lame est une question piège classique.`,
    questions: [
      {
        partTitle: "Partie I — Figure d'interférences",
        items: [
          {
            qNum: '1.a',
            statement: r`Montrer que la différence de marche en $M$ vaut $\delta = \frac{ax}{D}$ et en déduire l'intensité $I(x)$.`,
            math: r`I(x) = 2I_0\left(1 + \cos\frac{2\pi a x}{\lambda D}\right)`,
            hint: r`$S_{1,2} = (0, \mp a/2, 0)$, $M = (D, x, 0)$ ; développer $S_iM$ au premier ordre en $a/D$ et $x/D$.`,
            solution: r`$S_1M = \sqrt{D^2 + (x + a/2)^2} \approx D + \frac{(x+a/2)^2}{2D}$ et de même pour $S_2M$, d'où $\delta = S_1M - S_2M \approx \frac{ax}{D}$. Les deux ondes sont cohérentes, d'intensités $I_0$ : la formule de Fresnel donne $I = 2I_0\left(1 + \cos\frac{2\pi\delta}{\lambda}\right)$.`,
            points: 5,
          },
          {
            qNum: '1.b',
            statement: r`Exprimer l'interfrange $i$ et le calculer pour $\lambda = 589$ nm, $a = 0{,}50$ mm, $D = 1{,}00$ m.`,
            solution: r`Les franges brillantes vérifient $\delta = p\lambda$, soit $x_p = p\frac{\lambda D}{a}$ : franges rectilignes, parallèles aux fentes, équidistantes de $i = \frac{\lambda D}{a} = \frac{589\times10^{-9}\times1{,}00}{0{,}50\times10^{-3}} \approx 1{,}18$ mm.`,
            solutionMath: r`i = \frac{\lambda D}{a} \approx 1{,}18\ \text{mm}`,
            points: 4,
          },
        ],
      },
      {
        partTitle: 'Partie II — Influence de la largeur des fentes',
        items: [
          {
            qNum: '2',
            statement: r`Les fentes ont en fait une largeur $b \ll a$. L'intensité est modulée par le terme de diffraction $\text{sinc}^2\!\left(\frac{\pi b x}{\lambda D}\right)$. Déterminer la largeur de la tache centrale de diffraction et le nombre approximatif de franges brillantes qu'elle contient.`,
            solution: r`Le sinus cardinal s'annule pour $x = \pm\frac{\lambda D}{b}$ : la tache centrale a une largeur $\frac{2\lambda D}{b}$. Elle contient environ $\frac{2\lambda D/b}{\lambda D/a} = \frac{2a}{b}$ interfranges, soit de l'ordre de $\frac{2a}{b}$ franges brillantes (par exemple $20$ pour $a = 10b$).`,
            solutionMath: r`I(x) = 2I_0\,\text{sinc}^2\!\left(\frac{\pi bx}{\lambda D}\right)\left(1 + \cos\frac{2\pi ax}{\lambda D}\right)`,
            points: 5,
          },
        ],
      },
      {
        partTitle: "Partie III — Lame à faces parallèles",
        items: [
          {
            qNum: '3',
            statement: r`On place devant $S_1$ une lame de verre d'épaisseur $e$ et d'indice $n$. Décrire la modification de la figure. Application numérique : $e = 10\ \mu$m, $n = 1{,}5$.`,
            hint: r`La lame ajoute le chemin optique $(n-1)e$ sur la voie passant par $S_1$.`,
            solution: r`La différence de marche devient $\delta = \frac{ax}{D} + (n-1)e$. L'interfrange est inchangé mais la frange d'ordre $0$ ($\delta = 0$) se trouve en $x_0 = -\frac{(n-1)eD}{a}$ : toute la figure se translate de $\frac{(n-1)eD}{a}$ du côté de la fente couverte. AN : $\frac{0{,}5\times10\times10^{-6}\times1{,}00}{0{,}50\times10^{-3}} = 1{,}0$ cm, soit environ $8{,}5$ interfranges. Cette mesure permet de déterminer l'indice d'une lame mince (en lumière blanche pour repérer la frange centrale).`,
            solutionMath: r`\Delta x = \frac{(n-1)\,e\,D}{a} \approx 1{,}0\ \text{cm}`,
            points: 6,
          },
        ],
      },
    ],
  },
]
