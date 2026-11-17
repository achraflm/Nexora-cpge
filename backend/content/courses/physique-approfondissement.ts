import { latex, type CourseContent } from './format'

type Enrichment = Pick<CourseContent, 'sections' | 'exercises'>

export const physiqueApprofondissement: Record<string, Enrichment> = {
  'regimes-transitoires': {
    sections: [
      { title: 'Réduire le circuit vu par la capacité', latex: latex`Dans un réseau linéaire de résistances et de sources continues, remplacer la partie connectée à la capacité par le générateur de Thévenin de tension $E_{\mathrm{th}}$ et résistance $R_{\mathrm{th}}$. Calculer la tension à vide, puis la résistance vue aux bornes avec les sources indépendantes annulées.

Pendant une phase où le circuit est fixe, la tension s’écrit $E_{\mathrm{th}}+(u_0-E_{\mathrm{th}})e^{-t/(R_{\mathrm{th}}C)}$. Une nouvelle commutation peut modifier les deux paramètres. Refaire le schéma équivalent pour chaque phase.` },
      { title: 'Commutations successives et changement d’origine', latex: latex`Quand la seconde phase débute à $t=t_1$, utiliser le temps local $t-t_1$ et transmettre à cette phase la valeur du condensateur ou de la bobine juste avant la commutation. Pour une variable du premier ordre $x$, une phase écrit
$$ x(t)=x_\infty+(x(t_1^+)-x_\infty)e^{-(t-t_1)/\tau}. $$
Dans un RLC série, transmettre à la fois la charge et le courant si les tensions et courants concernés restent bornés. La pente peut changer brusquement lorsque l’excitation ou la résistance change.` },
      { title: 'Amortissement critique et identification sur une courbe', latex: latex`Le seuil critique du RLC série est $R_c=2\sqrt{L/C}$. Pour une décroissance du premier ordre, la tangente initiale atteint la valeur finale au bout d’une constante de temps, et l’écart au régime permanent est réduit d’un facteur $e$ à cet instant.

Si plusieurs extrema oscillants sont visibles, estimer la pseudo-période entre deux maxima du même signe et l’amortissement à partir du rapport de leurs écarts à la valeur finale. Vérifier que la droite expérimentale de $\ln|x-x_\infty|$ est cohérente avec un modèle exponentiel seulement quand un tel modèle est justifié.` },
      { title: 'Énergie fournie et effet de la résistance', latex: latex`Pour une charge RC depuis zéro sous une source idéale $E$, l’énergie fournie vaut $\int_0^\infty Ei\,\mathrm dt=E\int_0^{CE}\mathrm dq=CE^2$. La capacité en stocke $CE^2/2$ et la résistance dissipe l’autre moitié si $R>0$. Modifier $R$ change la vitesse de charge et la puissance maximale, mais pas ce résultat dans le modèle idéal.

Pour vérifier un calcul de puissance, distinguer le signe de la puissance reçue par chaque dipôle selon les conventions choisies.` },
    ],
    exercises: [
      {
        ref: 'NEX-RGT-03', title: 'Charge depuis une tension non nulle', difficulty: 2,
        statement: latex`Une capacité de $47\,\mathrm{\mu F}$ est initialement portée à $2{,}0\,\mathrm V$. On la relie à une source de $6{,}0\,\mathrm V$ via $10\,\mathrm{k\Omega}$. Établir $u_C(t)$, calculer le courant initial et l’instant où $u_C$ atteint $5{,}0\,\mathrm V$.`,
        hints: [latex`L’écart initial à la limite vaut $-4\,\mathrm V$.`, latex`Isoler l’exponentielle dans l’équation au seuil.`],
        solution: [
          { title: 'Équation et état initial', latex: latex`On a $\tau=RC=0{,}47\,\mathrm s$, puis $u_C(t)=6-4e^{-t/\tau}$ en volts. À $0^+$, le courant vaut $(6-2)/R=0{,}40\,\mathrm{mA}$.` },
          { title: 'Franchissement', latex: latex`La tension atteint $5\,\mathrm V$ quand $e^{-t/\tau}=1/4$, soit $t=0{,}47\ln4\simeq0{,}65\,\mathrm s$. La tension croît et le seuil est inférieur à sa limite, donc l’instant est unique.` },
        ],
      },
      {
        ref: 'NEX-RGT-04', title: 'Une bobine en deux phases', difficulty: 3,
        statement: latex`À courant initial nul, une bobine de $0{,}12\,\mathrm H$ est alimentée sous $12\,\mathrm V$ en série avec $6\,\mathrm\Omega$. Après $40\,\mathrm{ms}$, on retire la source et on ferme la boucle sur $9\,\mathrm\Omega$. Déterminer le courant à la commutation, puis la durée nécessaire pour tomber à $0{,}25\,\mathrm A$. Calculer l’énergie dissipée pendant toute la seconde phase.`,
        hints: [latex`La première constante de temps vaut $20\,\mathrm{ms}$.`, latex`La seconde phase démarre au courant de fin de phase précédente.`, latex`Pendant la décharge, la résistance reçoit toute l’énergie initiale de la bobine.`],
        solution: [
          { title: 'Charge', latex: latex`Le courant limite vaut $2\,\mathrm A$. À la commutation, $i_1=2(1-e^{-2})\simeq1{,}73\,\mathrm A$. Le courant est continu à cet instant.` },
          { title: 'Décharge et énergie', latex: latex`Dans la seconde phase, $\tau_2=0{,}12/9\simeq13{,}3\,\mathrm{ms}$ et $i=i_1e^{-\Delta t/\tau_2}$. Le seuil est atteint après $\Delta t=\tau_2\ln(i_1/0{,}25)\simeq25{,}8\,\mathrm{ms}$. L’énergie dissipée jusqu’à la fin vaut $Li_1^2/2\simeq0{,}179\,\mathrm J$.` },
        ],
      },
      {
        ref: 'NEX-RGT-05', title: 'Régler une décharge au régime critique', difficulty: 3,
        statement: latex`Un circuit RLC série libre a $L=40\,\mathrm{mH}$, $C=100\,\mathrm{\mu F}$, $q(0)=2{,}0\times10^{-4}\,\mathrm C$ et $i(0)=0$. Trouver $R$ pour atteindre le régime critique et exprimer $q(t)$.`,
        hints: [latex`Égaler $R/(2L)$ et $1/\sqrt{LC}$.`, latex`Une racine double produit un facteur affine devant l’exponentielle.`],
        solution: [
          { title: 'Valeur critique', latex: latex`On trouve $\omega_0=500\,\mathrm{s^{-1}}$, puis $R_c=2L\omega_0=40\,\mathrm\Omega$.` },
          { title: 'Conditions initiales', latex: latex`Posons $q(t)=(A+Bt)e^{-500t}$. On a $A=q(0)$ et $q'(0)=B-500A=0$. Donc $q(t)=q(0)(1+500t)e^{-500t}$. La charge tend vers zéro sans changer de signe.` },
        ],
      },
      {
        ref: 'NEX-RGT-06', title: 'Bilan chiffré d’une charge complète', difficulty: 3,
        statement: latex`Une capacité initialement vide, $C=220\,\mathrm{\mu F}$, est chargée sous $E=9{,}0\,\mathrm V$ par une résistance positive. Calculer l’énergie fournie, l’énergie stockée à la fin et l’énergie dissipée. Expliquer ce qui varie si l’on double $R$.`,
        hints: [latex`L’intégrale du courant fournit la charge finale.`, latex`Utiliser le bilan d’énergie plutôt que d’intégrer la puissance de Joule.`],
        solution: [
          { title: 'Bilan numérique', latex: latex`La source fournit $E(CE)=CE^2\simeq17{,}8\,\mathrm{mJ}$. Il reste $CE^2/2\simeq8{,}91\,\mathrm{mJ}$ dans la capacité. La différence, soit $8{,}91\,\mathrm{mJ}$, est dissipée.` },
          { title: 'Influence de la résistance', latex: latex`Doubler $R$ double $RC$ et divise le courant initial par deux. Les états initial et final sont identiques et les trois énergies calculées sont les mêmes.` },
        ],
      },
    ],
  },
  'induction-electromagnetique': {
    sections: [
      { title: 'Séparer champ, géométrie et orientation', latex: latex`Dans le cas uniforme plan, $\Phi=BS\cos\theta$. La dérivée du produit comporte une contribution pour chacune des grandeurs qui varie. Une spire fixe dans un champ non uniforme appelle une intégrale de surface. Une spire rigide qui tourne peut avoir une aire constante tout en présentant un flux variable.

Choisir la normale avant de calculer les signes. Le champ parallèle au plan donne un flux nul à cet instant, mais la force électromotrice peut être non nulle si l’orientation change.` },
      { title: 'Tension dans un circuit résistif et inductif', latex: latex`Quand un flux extérieur traverse une boucle fixe,
$$ L\dot i+Ri=e_{\mathrm{ext}},\qquad e_{\mathrm{ext}}=-\frac{\mathrm d\Phi_{\mathrm{ext}}}{\mathrm dt}. $$
L’auto-induction est déjà incluse dans le terme $L\dot i$. Ne pas la compter également à droite. Si le flux extérieur s’arrête de varier, le courant peut subsister et décroître avec $L/R$. Multiplier l’équation par $i$ pour vérifier le bilan entre stockage et dissipation.` },
      { title: 'Influence mutuelle et énergie magnétique', latex: latex`Pour deux circuits linéaires, orienter les courants avant d’écrire le flux lié $L_1i_1+Mi_2$ du premier et $Mi_1+L_2i_2$ du second. Dans ce modèle réciproque, l’énergie stockée est
$$ W=\tfrac12L_1i_1^2+Mi_1i_2+\tfrac12L_2i_2^2. $$
Elle doit être positive ou nulle pour tout couple de courants. En complétant le carré pour $L_1>0$, on obtient $M^2\le L_1L_2$. L’orientation change éventuellement le signe de $M$, sans modifier cette borne.` },
      { title: 'Rails de Laplace et contrôle du signe', latex: latex`Pour une barre entraînée à vitesse constante, déterminer le sens du courant à partir du flux, puis celui de la force sur la barre par le produit vectoriel. Le bilan sert de contrôle : si le champ et la résistance sont les seuls éléments actifs, la force magnétique s’oppose au mouvement imposé. La puissance mécanique fournie est $-\vec F\cdot\vec v$. On retrouve $Ri^2$ dans le modèle où aucune énergie magnétique supplémentaire n’est stockée.` },
    ],
    exercises: [
      {
        ref: 'NEX-IND-03', title: 'Tension d’une bobine en rotation', difficulty: 2,
        statement: latex`Une bobine de $40$ spires d’aire $0{,}012\,\mathrm{m^2}$ tourne à $30\,\mathrm{rad\,s^{-1}}$ dans un champ de $0{,}15\,\mathrm T$. La normale coïncide avec le champ à $t=0$. Donner la tension induite orientée, son amplitude et sa valeur efficace.`,
        hints: [latex`Le flux lié contient le nombre de spires.`, latex`La moyenne du carré d’un sinus sur une période vaut $1/2$.`],
        solution: [
          { title: 'Dérivée du flux', latex: latex`Le flux lié est $NBS\cos(30t)$. On le dérive et on change le signe. Il vient $e(t)=2{,}16\sin(30t)\,\mathrm V$.` },
          { title: 'Valeur efficace', latex: latex`L’amplitude vaut $2{,}16\,\mathrm V$. La valeur efficace est $2{,}16/\sqrt2\simeq1{,}53\,\mathrm V$. La tension est nulle au moment où le flux est maximal.` },
        ],
      },
      {
        ref: 'NEX-IND-04', title: 'Puissance nécessaire pour tirer une barre sur des rails', difficulty: 3,
        statement: latex`Une barre de longueur $0{,}35\,\mathrm m$ se déplace à $2{,}5\,\mathrm{m\,s^{-1}}$ sur des rails dans un champ perpendiculaire de $0{,}32\,\mathrm T$. La résistance totale vaut $0{,}80\,\mathrm\Omega$. Calculer la force électromotrice, le courant et la force à exercer pour garder cette vitesse. Comparer les puissances électrique et mécanique.`,
        hints: [latex`La variation d’aire par seconde est $\ell v$.`, latex`Lenz donne la direction de la force magnétique.`],
        solution: [
          { title: 'Électricité', latex: latex`Les valeurs absolues sont $|e|=B\ell v=0{,}28\,\mathrm V$ et $|i|=0{,}35\,\mathrm A$.` },
          { title: 'Mécanique et bilan', latex: latex`La force magnétique vaut $B\ell|i|\simeq0{,}039\,\mathrm N$ en sens opposé au déplacement. Il faut exercer la force opposée. Sa puissance vaut $0{,}098\,\mathrm W$, comme $Ri^2$.` },
        ],
      },
      {
        ref: 'NEX-IND-05', title: 'Courant transitoire dans une bobine secondaire', difficulty: 3,
        statement: latex`Deux bobines sont couplées avec $M=0{,}040\,\mathrm H$ dans les orientations choisies. Le courant primaire croît avec $\dot i_1=5{,}0\,\mathrm{A\,s^{-1}}$ dès $t=0$. La boucle secondaire a $R=3{,}0\,\mathrm\Omega$, $L=0{,}12\,\mathrm H$ et un courant initial nul. Trouver $i_2(t)$ pendant la rampe et l’évaluer à $80\,\mathrm{ms}$.`,
        hints: [latex`Le flux primaire produit une force électromotrice constante à droite de l’équation RL.`, latex`Vérifier que le courant secondaire est négatif avec l’orientation retenue.`],
        solution: [
          { title: 'Équation de la boucle', latex: latex`L’équation s’écrit $L\dot i_2+Ri_2=-M\dot i_1=-0{,}20\,\mathrm V$. La constante de temps est $0{,}040\,\mathrm s$.` },
          { title: 'Solution', latex: latex`La limite pour une rampe prolongée est $-0{,}20/3\,\mathrm A$. Ainsi $i_2(t)=-(0{,}20/3)(1-e^{-t/0{,}040})\,\mathrm A$. À $80\,\mathrm{ms}$, le résultat vaut environ $-0{,}0576\,\mathrm A$.` },
        ],
      },
      {
        ref: 'NEX-IND-06', title: 'Après la disparition du flux extérieur', difficulty: 2,
        statement: latex`Lorsque le flux extérieur se fige, une boucle de $R=5{,}0\,\mathrm\Omega$ et $L=0{,}25\,\mathrm H$ porte encore $i_0=0{,}80\,\mathrm A$. Donner le courant et l’énergie magnétique un temps $L/R$ après cet instant. Déterminer l’énergie totale dissipée à partir de cet instant initial.`,
        hints: [latex`L’excitation externe est nulle lorsque le flux devient constant.`, latex`L’énergie varie comme le carré du courant.`],
        solution: [
          { title: 'Décroissance', latex: latex`Avec $\tau=L/R=0{,}050\,\mathrm s$, le courant vaut $i_0e^{-t/\tau}$. Au bout de $\tau$, il vaut environ $0{,}294\,\mathrm A$ et l’énergie devient $(Li_0^2/2)e^{-2}\simeq0{,}0108\,\mathrm J$.` },
          { title: 'Dissipation', latex: latex`L’énergie initiale est $Li_0^2/2=0{,}080\,\mathrm J$ et le courant finit par s’annuler. Toute cette énergie est dissipée par effet Joule.` },
        ],
      },
    ],
  },
}
