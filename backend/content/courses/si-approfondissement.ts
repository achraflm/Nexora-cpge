import { latex, type CourseContent } from './format'

export const siApprofondissement: Pick<CourseContent, 'sections' | 'exercises'> = {
  sections: [
    { title: 'Passer d’un modèle physique au schéma-blocs', latex: latex`Identifier d’abord les entrées indépendantes, par exemple une tension de commande et un couple résistant. Écrire une équation pour chaque relation électrique et mécanique, puis prendre la transformée sous conditions initiales nulles. Construire les blocs à partir de ces équations, sans perdre les signes.

Pour un moteur à courant continu sans inductance significative, $u=Ri+k_e\omega$ et $J\dot\omega+f\omega=k_t i-C_r$. La vitesse influe sur le courant via la force contre-électromotrice, même avant l’ajout d’une boucle de régulation externe.` },
    { title: 'Distinguer consigne et perturbation', latex: latex`Un système peut avoir plusieurs entrées et une seule sortie. Pour trouver un transfert, annuler les autres entrées sans supprimer physiquement les blocs. Une perturbation $D$ ajoutée à la sortie d’une chaîne directe $G$ donne, avec le capteur $B$,
$$ Y=\frac{G}{1+GB}R+\frac{1}{1+GB}D. $$
Si $D$ est additive à l’entrée de $G$, le second terme devient $GD/(1+GB)$. Ces deux modèles n’ont pas les mêmes unités pour $D$. Nommer l’endroit où elle apparaît sur le schéma.` },
    { title: 'Régler un retour sur un modèle du premier ordre', latex: latex`Avec $G(p)=K/(1+\tau p)$ et un capteur constant $b$, la boucle négative a pour transfert
$$ H(p)=\frac{K}{1+Kb+\tau p}. $$
Pour $\tau>0$ et $1+Kb>0$, on lit un gain statique $K/(1+Kb)$ et une constante de temps $\tau/(1+Kb)$. L’erreur en régime permanent porte sur $R-bY$, c’est-à-dire sur deux signaux exprimés dans les mêmes unités.

Comparer chaque exigence du cahier des charges séparément. Une contrainte sur la rapidité et une autre sur la précision produisent souvent deux bornes différentes sur le gain.` },
    { title: 'Contrôles avant de conclure', latex: latex`Revenir aux limites : si le gain direct tend vers zéro, le suivi de consigne doit disparaître. Pour un système stable, vérifier le gain à fréquence nulle et les unités. Un pôle à partie réelle négative fait décroître sa contribution. Un terme intégrateur peut annuler l’écart statique à une consigne constante si la boucle reste stable, mais il modifie l’ordre et les pôles. Il faut donc contrôler la stabilité avant d’en déduire un gain de précision.` },
  ],
  exercises: [
    {
      ref: 'NEX-SLC-03', title: 'Un capteur de gain différent de un', difficulty: 2,
      statement: latex`La chaîne directe est $G(p)=6/(1+0{,}40p)$ et le capteur a un gain $b=1/3$. On applique un échelon de consigne unitaire. Calculer le gain et la constante de temps en boucle fermée, l’écart de mesure final et le temps de réponse à $5\,\%$.`,
      hints: [latex`La comparaison porte sur $R-bY$.`, latex`Mettre le dénominateur sous la forme constante multipliée par $1+\tau_f p$.`],
      solution: [
        { title: 'Fonction de transfert', latex: latex`On trouve $H=6/(3+0{,}40p)$. Le gain statique vaut $2$ et la constante de temps $0{,}40/3\simeq0{,}133\,\mathrm s$.` },
        { title: 'Performances', latex: latex`La sortie tend vers $2$, donc l’écart mesuré tend vers $1-2/3=1/3$. Le temps de réponse vaut $\tau_f\ln20\simeq0{,}40\,\mathrm s$.` },
      ],
    },
    {
      ref: 'NEX-SLC-04', title: 'Identifier les deux entrées d’un moteur', difficulty: 3,
      statement: latex`Un moteur est modélisé par $u=Ri+k_e\omega$ et $J\dot\omega+f\omega=k_ti-C_r$. Trouver les fonctions de transfert de $u$ et de $C_r$ vers $\omega$. Expliquer le signe du second transfert.`,
      hints: [latex`Exprimer $i$ à partir de la tension.`, latex`Regrouper en un seul membre tous les termes en vitesse avant de lire les transferts.`],
      solution: [
        { title: 'Élimination du courant', latex: latex`En substituant et en passant dans le domaine de Laplace avec état initial nul, on obtient
$$ [R(Jp+f)+k_tk_e]\Omega=k_t U-RC_r. $$` },
        { title: 'Deux transferts', latex: latex`Pour l’entrée de commande, annuler $C_r$ : le transfert est $k_t/[R(Jp+f)+k_tk_e]$. Pour la perturbation, annuler $U$ : il reste $-R/[R(Jp+f)+k_tk_e]$. Un couple résistant positif s’oppose au mouvement, d’où le signe négatif.` },
      ],
    },
    {
      ref: 'NEX-SLC-05', title: 'Une perturbation ajoutée en sortie de la chaîne directe', difficulty: 3,
      statement: latex`Avec retour unitaire négatif, on a $G(p)=5/(p+2)$ et $Y=G(R-Y)+D$. Trouver les transferts séparés. Pour une consigne constante $1$ et une perturbation constante $0{,}70$ appliquées à partir de zéro, déterminer la sortie finale.`,
      hints: [latex`Isoler $Y$ avant de remplacer $G$.`, latex`Contrôler la position du pôle avant d’utiliser la valeur finale.`],
      solution: [
        { title: 'Superposition', latex: latex`On trouve $Y/R=5/(p+7)$ lorsque $D=0$, et $Y/D=(p+2)/(p+7)$ lorsque $R=0$. Les deux transferts ont un pôle à $-7$.` },
        { title: 'Régime permanent', latex: latex`La contribution de la consigne vaut $5/7$. Celle de la perturbation vaut $(2/7)\times0{,}70=0{,}20$. La sortie finale est donc $5/7+0{,}20\simeq0{,}914$.` },
      ],
    },
    {
      ref: 'NEX-SLC-06', title: 'Choisir le plus petit gain conforme au cahier des charges', difficulty: 3,
      statement: latex`Un procédé $P(p)=1/(p+4)$ est commandé par un gain proportionnel $K\ge0$ avec retour unitaire négatif. On exige une constante de temps au plus égale à $0{,}10\,\mathrm s$ et un écart permanent au plus égal à $0{,}20$ pour une consigne unitaire. Déterminer le plus petit gain, puis vérifier les deux exigences.`,
      hints: [latex`La chaîne directe vaut $KP$.`, latex`Exprimer séparément la constante de temps et l’écart statique en fonction de $K$.`],
      solution: [
        { title: 'Deux inégalités', latex: latex`Le transfert est $K/(p+4+K)$ et son pôle est négatif. La constante de temps $1/(4+K)$ impose $K\ge6$. L’écart permanent $1-K/(4+K)=4/(4+K)$ impose $K\ge16$.` },
        { title: 'Choix final', latex: latex`Le plus petit gain compatible est $16$. Il donne $\tau_f=0{,}050\,\mathrm s$ et un écart de $0{,}20$. La précision est la contrainte active.` },
      ],
    },
  ],
}
