import { latex, type CourseContent } from './format'

const edition = 'https://d3bxy9euw4e147.cloudfront.net/oscms-prod/media/documents/UniversityPhysicsVolume2-OP.pdf'
const source = {
  book: 'University Physics Volume 2, édition 2018',
  author: 'Samuel J. Ling, Jeff Sanny et William Moebs (OpenStax, Rice University)',
  url: edition,
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  attributionUrl: 'https://openstax.org/details/books/university-physics-volume-2',
} as const

export const physique: CourseContent[] = [
  {
    slug: 'regimes-transitoires', subject: 'PHYS', level: 'SUP', title: 'Régimes transitoires', domain: 'Électrocinétique',
    summary: 'Modéliser les commutations des circuits RC, RL et RLC série, exploiter les conditions initiales et contrôler la solution par les limites et les bilans d’énergie.',
    minutes: 110, source: { ...source, url: edition + '#page=479' },
    sections: [
      { title: 'Objectifs et prérequis', latex: latex`Revoir les lois de Kirchhoff, les conventions récepteur et les équations différentielles linéaires à coefficients constants. On suppose les dipôles idéaux et l’approximation des régimes quasi permanents applicable. Après une commutation, redessiner le circuit valable pour $t>0$.` },
      { title: 'Grandeurs d’état et continuité', latex: latex`Dans la convention récepteur, $i_C=C\,\mathrm du_C/\mathrm dt$ et $u_L=L\,\mathrm di_L/\mathrm dt$. Intégrer autour de la commutation. Si le courant de la capacité et la tension de la bobine restent localement bornés, alors $u_C(0^+)=u_C(0^-)$ et $i_L(0^+)=i_L(0^-)$.

Pour déterminer les valeurs à gauche en régime continu établi, remplacer le condensateur par un circuit ouvert et la bobine idéale par un court-circuit. Réutiliser ces modèles pour obtenir les limites à droite si le nouveau régime permanent existe.` },
      { title: 'Circuit RC série', latex: latex`Dans une boucle source constante $E$, résistance $R$ et condensateur $C$, écrire $E=Ri+u_C$, puis substituer $i=C\dot u_C$. L’écart à la valeur finale vérifie une équation homogène.
$$ RC\dot u_C+u_C=E,\qquad u_C(t)=E+(u_C(0^+)-E)e^{-t/(RC)}. $$
Pour une décharge dans $R$, prendre $E=0$. Pour une charge depuis zéro, $i(t)=(E/R)e^{-t/(RC)}$. À une constante de temps $RC$, environ $63{,}2\,\%$ du saut de tension est accompli.` },
      { title: 'Circuit RL série', latex: latex`Écrire la loi des mailles en substituant la relation de la bobine. L’intensité tend vers la valeur donnée par Ohm et la tension de la bobine idéale tend vers zéro.
$$ L\dot i+Ri=E,\qquad i(t)=\frac ER+\left(i(0^+)-\frac ER\right)e^{-tR/L}. $$
La constante de temps est $L/R$. Lorsqu’une source est retirée mais que la boucle reste fermée par la résistance, l’intensité décroît sans sauter à zéro.` },
      { title: 'Circuit RLC série et trois régimes', latex: latex`Avec la charge $q$, on obtient $L\ddot q+R\dot q+q/C=E$ et $\dot q=i$. Poser $x=q-CE$, $\alpha=R/(2L)$ et $\omega_0=1/\sqrt{LC}$. L’équation pour $x$ a pour polynôme caractéristique $r^2+2\alpha r+\omega_0^2$.

Lorsque $\alpha<\omega_0$, la réponse est $e^{-\alpha t}(A\cos\omega t+B\sin\omega t)$ avec $\omega=\sqrt{\omega_0^2-\alpha^2}$. Si $\alpha=\omega_0$, elle est $(A+Bt)e^{-\alpha t}$. Si $\alpha>\omega_0$, elle est une somme de deux exponentielles réelles décroissantes. Déterminer les deux constantes avec $q(0^+)$ et $i(0^+)$.` },
      { title: 'Bilan d’énergie', latex: latex`Multiplier l’équation de maille par le courant. L’énergie emmagasinée est la somme des termes électrique et magnétique, tandis que la résistance dissipe de la puissance.
$$ \mathcal U=\frac{q^2}{2C}+\frac12Li^2,\qquad \frac{\mathrm d\mathcal U}{\mathrm dt}=Ei-Ri^2. $$
Pour une décharge sans source, l’énergie décroît même si la tension ou le courant oscille en changeant de signe.` },
      { title: 'Exemple et méthode CNC', latex: latex`Avec $R=2\,\mathrm{k\Omega}$, $C=100\,\mathrm{\mu F}$ et une source de $5\,\mathrm V$, un condensateur initialement vide atteint $4\,\mathrm V$ à $t=RC\ln 5\simeq0{,}322\,\mathrm s$. La formule de seuil n’a de solution finie que si le seuil est strictement entre la tension initiale et la limite.

Avant tout calcul, distinguer la grandeur qui reste continue de la grandeur dont on cherche l’évolution. Vérifier l’unité de la constante de temps et la pente initiale à l’aide de la loi de maille.` },
      { title: 'Fiche de révision', latex: latex`Trouver les états initial et final, poser l’écart à la limite, résoudre le système homogène et vérifier les signes. Au premier ordre, l’écart est multiplié par $e^{-1}$ après une constante de temps. Au second ordre, examiner le discriminant avant d’identifier le régime.` },
    ],
    exercises: [
      {
        ref: 'OST-SUP-10-09', title: 'Régler l’intervalle des essuie-glaces', locator: '§ 10.5, exemple 10.9, p. 474', url: edition + '#page=484', difficulty: 2,
        statement: latex`Une source idéale de $12\,\mathrm V$ charge un condensateur de $10{,}00\,\mathrm{mF}$ à travers un rhéostat réglable de $0$ à $10{,}00\,\mathrm{k\Omega}$. Lorsque la tension du condensateur atteint $10{,}00\,\mathrm V$, un interrupteur ferme le circuit du moteur et ramène la tension à zéro. Négliger la durée de cette remise à zéro. Quel réglage impose un balayage toutes les $10{,}00\,\mathrm s$ ?`,
        hints: [latex`Étudier seulement la branche de charge entre deux balayages.`, latex`Au seuil, isoler $e^{-T/(RC)}$ avant d’appliquer le logarithme.`, latex`Convertir les millifarads en farads avant le calcul de $R$.`],
        solution: [
          { title: 'Phase de charge', latex: latex`La tension part de zéro et suit $u_C(t)=12(1-e^{-t/(RC)})$ en volts. À $t=T$, le seuil donne $e^{-T/(RC)}=1-10/12=1/6$.` },
          { title: 'Résistance', latex: latex`Prenons le logarithme. Comme $\ln(1/6)=-\ln 6$, on obtient
$$ R=\frac{T}{C\ln6}=\frac{10{,}00}{0{,}01000\ln6}\,\mathrm\Omega\simeq558\,\mathrm\Omega. $$` },
          { title: 'Vérification', latex: latex`La résistance est comprise dans la plage imposée et le seuil est accessible puisque $10<12$. Augmenter $R$ ralentit la charge et espace les balayages.` },
        ],
      },
      {
        ref: 'OST-SUP-14-04', title: 'Établissement du courant dans une bobine', locator: '§ 14.4, exemple 14.4, p. 642–643', url: edition + '#page=652', difficulty: 2,
        statement: latex`Un générateur de $2{,}0\,\mathrm V$ est appliqué à $t=0$ à une boucle série comportant une résistance de $4{,}0\,\mathrm\Omega$ et une inductance de $4{,}0\,\mathrm H$. Le courant initial est nul. Déterminer la constante de temps, puis le courant et la valeur absolue de la tension inductive à $t=0^+$, $t=2\tau$ et au régime permanent.`,
        hints: [latex`Appliquer la loi des mailles avec $u_L=L\dot i$.`, latex`Le courant démarre à zéro et tend vers $E/R$.`, latex`Calculer la tension inductive par $E-Ri$, puis comparer les trois instants.`],
        solution: [
          { title: 'Constante et expressions', latex: latex`Ici $\tau=L/R=1{,}0\,\mathrm s$. L’équation $L\dot i+Ri=E$ donne
$$ i(t)=0{,}50(1-e^{-t/\tau})\,\mathrm A,\qquad |u_L(t)|=2{,}0e^{-t/\tau}\,\mathrm V. $$` },
          { title: 'Valeurs', latex: latex`À $0^+$, le courant est nul et la tension vaut $2{,}0\,\mathrm V$. À $2\tau$, le courant vaut environ $0{,}43\,\mathrm A$ et la tension $0{,}27\,\mathrm V$. À l’infini, on trouve $0{,}50\,\mathrm A$ et $0\,\mathrm V$.` },
          { title: 'Interprétation', latex: latex`La bobine reçoit toute la tension à l’instant initial. En régime continu établi, sa dérivée de courant est nulle et la résistance reçoit toute la tension.` },
        ],
      },
    ],
    quiz: [
      { question: 'Quelle grandeur reste continue pour une bobine idéale dont la tension est bornée ?', answers: ['Sa tension', 'Son courant', 'La tension du générateur'], correct: 1, explanation: 'Intégrer la relation entre tension et dérivée du courant autour de la commutation.' },
      { question: latex`Après combien de temps l’écart à la limite est-il divisé par $e$ dans un circuit RC ?`, answers: [latex`$RC$`, latex`$R/C$`, latex`$1/(RC)$`], correct: 0, explanation: latex`Le facteur transitoire est $e^{-t/(RC)}$.` },
    ],
  },
  {
    slug: 'induction-electromagnetique', subject: 'PHYS', level: 'SPE', title: 'Induction électromagnétique', domain: 'Électromagnétisme',
    summary: 'Orienter un circuit et sa surface, calculer une force électromotrice de Faraday et en exploiter le signe, puis relier le courant induit aux échanges d’énergie.',
    minutes: 115, source: { ...source, url: edition + '#page=592' },
    sections: [
      { title: 'Objectifs et prérequis', latex: latex`Revoir le champ magnétique, le produit scalaire, les intégrales de surface et la loi des mailles. On distingue les circuits fixes soumis à un champ variable et les conducteurs mobiles. Dans le cadre quasi statique, on néglige les retards de propagation à l’échelle du circuit.` },
      { title: 'Orientation et flux', latex: latex`Orienter le contour $\Gamma$, puis associer la normale de $S$ par la règle de la main droite. Pour une spire, le flux du champ magnétique vaut
$$ \Phi=\int_S \vec B\cdot\vec n\,\mathrm dS. $$
Si le champ est uniforme et la surface plane, $\Phi=BS\cos\theta$, où $\theta$ est l’angle du champ avec la normale. En inversant l’orientation, le flux change de signe. L’unité est le weber.` },
      { title: 'Loi de Faraday et loi de Lenz', latex: latex`La force électromotrice dans le sens positif choisi vaut $e=-\mathrm d\Phi/\mathrm dt$. Pour $N$ spires traversées par le même flux orienté, dériver le flux total $N\Phi$. Avec une résistance dominante et une inductance négligée, $i=e/R$.

Le champ dû au courant induit tend à contrarier la variation du flux. Un flux positif décroissant peut donc engendrer un courant positif qui renforce le champ initial. Le signe se juge après le choix de l’orientation.` },
      { title: 'Circuit fixe et champ variable', latex: latex`Dans un circuit immobile, l’induction résulte de la circulation du champ électrique. Intégrer Maxwell–Faraday sur la surface fixe et utiliser le théorème de Stokes.
$$ \oint_\Gamma\vec E\cdot\mathrm d\vec\ell=\int_S(\nabla\times\vec E)\cdot\mathrm d\vec S=-\frac{\mathrm d\Phi}{\mathrm dt}. $$
La circulation peut être non nulle : le champ électrique induit ne se décrit alors pas partout comme le gradient d’un potentiel scalaire.` },
      { title: 'Conducteur mobile et bilan de puissance', latex: latex`La force magnétique exercée sur les porteurs accompagne le mouvement du conducteur. La contribution électromotrice se calcule avec $(\vec v\times\vec B)\cdot\mathrm d\vec\ell$. Sur rails, une barre de longueur $\ell$ modifie l’aire à la vitesse $\ell v$. Dans le modèle résistif et pour un champ perpendiculaire, $|e|=B\ell |v|$.

La force de Laplace freine le mouvement qui crée le courant. Le travail fourni par l’opérateur compense la dissipation si la vitesse reste constante et l’inductance est négligée.
$$ |F|=\frac{B^2\ell^2|v|}R,\qquad P_J=\frac{(B\ell v)^2}R. $$` },
      { title: 'Auto-induction et influence mutuelle', latex: latex`Le flux lié dû au courant propre vaut $Li$ pour un circuit fixe linéaire. La force électromotrice propre vaut $-L\dot i$ et la tension en convention récepteur vaut $L\dot i$. L’énergie magnétique stockée est $Li^2/2$. Si deux circuits sont couplés, le flux lié du second contient aussi $Mi_1$. Le signe de $M$ dépend des orientations retenues.
$$ v_2=L_2\dot i_2+M\dot i_1. $$` },
      { title: 'Exemple, méthode CNC et erreurs', latex: latex`Une bobine tourne à vitesse angulaire $\omega$ dans un champ uniforme. Pour une spire plane d’aire $S$, prendre $\theta(t)=\omega t$ si la normale est alignée avec le champ à $t=0$. Alors $e=NBS\omega\sin(\omega t)$.

Sur une copie, dessiner ou nommer la normale, exprimer le flux avec son signe, dériver, puis vérifier par Lenz. Attention au facteur $N$, au choix de l’angle et au passage d’une valeur algébrique à une valeur absolue.` },
      { title: 'Fiche de révision', latex: latex`Toute variation de champ, d’aire ou d’orientation peut modifier le flux. Le signe de Faraday compare la f.é.m. au sens choisi. La loi de Lenz contrôle le résultat. Pour un circuit couplé ou mobile, compléter le calcul électrique par un bilan de puissance ou d’énergie.` },
    ],
    exercises: [
      {
        ref: 'OST-SPE-13-01', title: 'Bobine carrée dans un champ décroissant', locator: '§ 13.1, exemple 13.1, p. 585', url: edition + '#page=595', difficulty: 1,
        statement: latex`Une bobine carrée de côté $0{,}25\,\mathrm m$ possède $200$ spires et présente une résistance de $5{,}0\,\mathrm\Omega$. Elle est fixe dans un champ uniforme normal à son plan, dont la norme diminue à $0{,}040\,\mathrm{T\,s^{-1}}$. Déterminer les valeurs absolues de la force électromotrice et du courant. On néglige l’auto-induction.`,
        hints: [latex`Choisir la normale dans le sens du champ et exprimer le flux d’une spire.`, latex`La surface est constante. Dériver uniquement $B(t)$ et multiplier par le nombre de spires.`, latex`Utiliser la résistance de la bobine entière.`],
        solution: [
          { title: 'Flux lié', latex: latex`Pour la normale choisie, chaque spire reçoit $\Phi=B\ell^2$. La dérivée du flux lié est $N\ell^2\dot B$.` },
          { title: 'Force électromotrice et courant', latex: latex`D’après Faraday, la force électromotrice algébrique est positive, car $\dot B<0$.
$$ |e|=200(0{,}25)^2(0{,}040)\,\mathrm V=0{,}50\,\mathrm V,\qquad |i|=\frac{0{,}50}{5{,}0}\,\mathrm A=0{,}10\,\mathrm A. $$` },
          { title: 'Contrôle du sens', latex: latex`Le courant positif crée un champ dans le même sens que la normale. Il compense partiellement la diminution du flux excitateur.` },
        ],
      },
      {
        ref: 'OST-SPE-13-02', title: 'Spire circulaire dans un champ exponentiel', locator: '§ 13.2, exemple 13.2, p. 588–589', url: edition + '#page=598', difficulty: 2,
        statement: latex`Une spire circulaire de rayon $0{,}50\,\mathrm m$ et de résistance $10\,\mathrm\Omega$ est immobile. Le champ uniforme dans la surface est dirigé suivant la normale sortante et sa norme vaut $B(t)=1{,}5 e^{-5{,}0t}\,\mathrm T$, avec $t$ en secondes. Calculer la force électromotrice et le courant signé à $0$, $0{,}050\,\mathrm s$ et $1{,}0\,\mathrm s$. On néglige l’auto-induction.`,
        hints: [latex`L’aire de la spire est $\pi r^2$. Le flux est positif avec l’orientation suggérée.`, latex`Dériver l’exponentielle en conservant la constante de décroissance.`, latex`La circulation positive vue face à la normale sortante est antihoraire.`],
        solution: [
          { title: 'Calcul en fonction du temps', latex: latex`Le flux est $\pi r^2 B(t)$. Sa dérivée étant négative, la f.é.m. vaut $e(t)=7{,}5\pi r^2e^{-5t}\,\mathrm V$, soit environ $5{,}89e^{-5t}\,\mathrm V$.` },
          { title: 'Applications numériques', latex: latex`La loi d’Ohm donne $i=e/10$. Les valeurs approchées sont
$$ \begin{array}{c|ccc} t\,(\mathrm s)&0&0{,}050&1{,}0\\ \hline e\,(\mathrm V)&5{,}89&4{,}59&0{,}0397\\ i\,(\mathrm A)&0{,}589&0{,}459&0{,}00397 \end{array}. $$` },
          { title: 'Sens et ordre de grandeur', latex: latex`Tous les courants sont positifs dans l’orientation annoncée. Le champ qu’ils créent est sortant, ce qui s’oppose à la diminution du champ excitateur. Lorsque la variation du flux s’éteint, le courant tend vers zéro.` },
        ],
      },
    ],
    quiz: [
      { question: 'Un flux positif décroît dans le temps. Quel est le signe de la force électromotrice selon le sens positif choisi ?', answers: ['Positif', 'Négatif', 'Toujours nul'], correct: 0, explanation: 'Faraday prend l’opposé de la dérivée du flux.' },
      { question: 'Quel angle apparaît dans le flux d’un champ uniforme à travers une surface plane ?', answers: ['L’angle avec la normale orientée', 'L’angle avec le plan de la surface', 'L’angle avec le courant'], correct: 0, explanation: 'Le flux est le produit scalaire du champ et du vecteur surface.' },
    ],
  },
]
