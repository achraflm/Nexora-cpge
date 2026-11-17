import { latex, type CourseContent } from './format'

const loops = 'https://en.wikibooks.org/wiki/Control_Systems/Feedback_Loops'
const transfers = 'https://en.wikibooks.org/wiki/Control_Systems/Transfer_Functions'

export const si: CourseContent = {
  slug: 'modelisation-systemes-asservis', subject: 'SI', level: 'SPE', title: 'Modélisation des systèmes asservis', domain: 'Automatique',
  summary: 'Transformer un modèle différentiel en schéma-blocs, calculer la fonction de transfert en boucle fermée et distinguer réponse, erreur et stabilité.',
  minutes: 100, legacyId: 'si-slci',
  source: { book: 'Control Systems', author: 'Contributeurs de Wikibooks', url: loops, license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  sections: [
    { title: 'Objectifs et prérequis', latex: latex`Revoir les équations différentielles linéaires et les fractions rationnelles. On cherche un modèle entrées-sorties d’un système linéaire, continu et invariant autour d’un point de fonctionnement. Distinguer la consigne, l’action de commande, la sortie mesurée et les perturbations.` },
    { title: 'Modèle et fonction de transfert', latex: latex`Pour un système scalaire, prendre la transformée de Laplace unilatérale de l’équation qui relie les signaux d’entrée $u$ et de sortie $y$. La fonction de transfert correspond à des conditions initiales nulles, lorsqu’on décrit les écarts au point de fonctionnement.
$$ H(p)=\frac{Y(p)}{U(p)},\qquad \mathcal L\{\dot y\}=pY(p)-y(0^-). $$
Par exemple, $\tau\dot y+y=Ku$ conduit à $H=K/(1+\tau p)$ sous ces hypothèses. Avec $y(0^-)\ne0$, traiter séparément la contribution de l’état initial.` },
    { title: 'Combiner des blocs', latex: latex`En série, la sortie du premier bloc devient l’entrée du second. On multiplie les transferts. En parallèle, si deux branches reçoivent la même entrée, le sommateur ajoute ou retranche leurs sorties selon les signes indiqués.
$$ \text{série : }H=H_2H_1,\qquad \text{parallèle signé : }H=H_1\pm H_2. $$
Un prélèvement copie la grandeur à un nœud. Avant de déplacer un sommateur ou un prélèvement, vérifier que les deux schémas conservent exactement les mêmes équations.` },
    { title: 'Retour négatif', latex: latex`Soit $R$ la consigne exprimée dans l’unité du signal mesuré, $G$ la chaîne directe et $B$ le transfert du capteur. Le comparateur forme $E=R-BY$. La chaîne directe donne $Y=GE$. Substituer la première équation dans la seconde, puis isoler la sortie.
$$ \frac{Y}{R}=\frac{G}{1+GB},\qquad \frac{E}{R}=\frac1{1+GB}. $$
Le produit $GB$ est le transfert de boucle. En retour positif, le même raisonnement donne un dénominateur $1-GB$. Pour un retour unitaire, prendre $B=1$.` },
    { title: 'Perturbation et stabilité', latex: latex`Si $D$ s’ajoute en sortie du procédé, écrire $Y=G(R-BY)+D$. On obtient $Y_D=D/(1+GB)$ à consigne nulle. Identifier l’emplacement de la perturbation avant de choisir la formule.

En temps continu, les pôles d’une fonction rationnelle simplifiée doivent avoir une partie réelle strictement négative pour assurer la stabilité entrée-sortie. Une simplification de facteurs peut masquer un mode interne. Vérifier la stabilité avant d’appliquer le théorème de la valeur finale.` },
    { title: 'Réponse à un échelon et régime permanent', latex: latex`Une consigne en échelon d’amplitude $R_0$ a pour transformée $R_0/p$. Calculer $Y(p)$, puis effectuer une décomposition en éléments simples. Si les pôles pertinents de $pY(p)$ sont strictement à gauche, $y(\infty)=\lim_{p\to0}pY(p)$.

Pour $H(p)=K/(1+\tau p)$ avec $\tau>0$, la sortie initialement nulle vaut $KR_0(1-e^{-t/\tau})$. Le temps de réponse à $5\,\%$ se lit en résolvant $e^{-t/\tau}=0{,}05$, soit environ $3\tau$.` },
    { title: 'Exemple et réflexes CNC', latex: latex`Boucler $G=2/(1+p)$ avec un capteur unitaire donne $H=2/(p+3)$. La constante de temps devient $1/3$ et le gain statique $2/3$. Pour un échelon unitaire, l’écart permanent vaut $1/3$. Une réponse plus rapide n’implique donc pas une erreur statique nulle.

Sur une copie, nommer les unités des deux signaux comparés, écrire les équations du comparateur et de la sortie, puis identifier le dénominateur avant de discuter les pôles.` },
    { title: 'Fiche de révision', latex: latex`Conditions initiales nulles pour un transfert, produit pour les blocs en série, somme signée pour le parallèle. En boucle négative, écrire $E=R-BY$ et $Y=GE$. Calculer séparément l’effet des perturbations, puis contrôler statiquement et dynamiquement le résultat.` },
  ],
  exercises: [
    {
      ref: 'WKB-SPE-SI-01', title: 'Réduire la boucle de retour unitaire', locator: 'Feedback Loops, dérivation du transfert de boucle', url: loops + '#Feedback_Loop_Transfer_Function', difficulty: 2,
      statement: latex`La chaîne directe a pour transfert $G(p)$. En retour unitaire négatif, la sortie $Y$ est prélevée et soustraite à la consigne $R$. Établir les deux fonctions $Y/R$ et $E/R$, où $E$ est l’écart en entrée de la chaîne directe.
$$ R\longrightarrow\boxed{\ R-Y\ }\overset{E}{\longrightarrow}\boxed{G(p)}\longrightarrow Y. $$`,
      hints: [latex`À quelle grandeur le bloc $G$ est-il réellement appliqué ?`, latex`Remplacer $E$ dans l’égalité $Y=GE$.`, latex`Ramener à gauche les deux termes qui dépendent de $Y$.`],
      solution: [
        { title: 'Équations du schéma', latex: latex`Le comparateur donne $E=R-Y$ et la chaîne directe donne $Y=GE$.` },
        { title: 'Sortie en boucle fermée', latex: latex`On obtient $Y=GR-GY$, donc $(1+G)Y=GR$ et $Y/R=G/(1+G)$.` },
        { title: 'Fonction d’écart', latex: latex`En divisant l’équation du comparateur par $R$, il reste $E/R=1-G/(1+G)=1/(1+G)$. Si le gain de boucle en régime permanent est grand et que la boucle est stable, l’écart statique normalisé devient petit.` },
      ],
    },
    {
      ref: 'WKB-SPE-SI-02', title: 'Réponse impulsionnelle et réponse indicielle', locator: 'Transfer Functions, exemples Impulse Response et Step Response', url: transfers + '#Using_the_Transfer_Function', difficulty: 2,
      statement: latex`Pour un système de fonction de transfert $H(p)$ et initialement au repos, exprimer la sortie dans le domaine de Laplace lorsque l’entrée est une impulsion de Dirac, puis lorsqu’elle est un échelon unitaire. Quelle relation temporelle relie les deux réponses causales ?`,
      hints: [latex`Écrire $Y=HU$ pour chacune des deux entrées.`, latex`La division par $p$ désigne une opération temporelle sur un signal causal.`],
      solution: [
        { title: 'Entrée impulsionnelle', latex: latex`La transformée de l’impulsion unitaire est $1$. Donc $Y_{\mathrm{imp}}(p)=H(p)$.` },
        { title: 'Entrée indicielle', latex: latex`La transformée de l’échelon unitaire est $1/p$. Par conséquent $Y_{\mathrm{ech}}(p)=H(p)/p$.` },
        { title: 'Lien dans le domaine temporel', latex: latex`Pour une réponse impulsionnelle ordinaire, la réponse à l’échelon est sa primitive causale, $y_{\mathrm{ech}}(t)=\int_0^t y_{\mathrm{imp}}(\sigma)\,d\sigma$. La formule $H(p)/p$ concerne la transformée de la réponse et reste valable même si la réponse impulsionnelle porte une contribution instantanée.` },
      ],
    },
  ],
  quiz: [
    { question: latex`Deux blocs $G$ et $B$ sont en retour négatif. Quel est le dénominateur de boucle ?`, answers: [latex`$1+GB$`, latex`$1-GB$`, latex`$G+B$`], correct: 0, explanation: latex`La substitution $Y=G(R-BY)$ fait passer $GBY$ à gauche.` },
    { question: 'Quelle grandeur doit-on vérifier avant le théorème de la valeur finale ?', answers: ['Le nombre de capteurs', 'Les pôles de la grandeur transformée pertinente', 'Le nombre de blocs en chaîne directe'], correct: 1, explanation: 'Des pôles instables peuvent empêcher l’existence d’une valeur finale.' },
  ],
}
