# Range, Null Space, and Orthogonality

*Companion notes for the "Spaces and Transformations" slideshow. Section
numbers below match the slideshow's own three worked examples; light click
markers help you follow along either while presenting or while reading.*

Every linear map $A$ has a shape, and that shape is best understood through
four subspaces: its **range** (what it can reach), its **null space** (what
it collapses to zero), its **row space** — the range of $A^T$ — and its
**left null space** — the null space of $A^T$. The three examples below walk
through what those subspaces look like geometrically, starting simple and
building up.

## Example 1: An invertible transformation

We start with

$$
A = \begin{bmatrix} 2 & 1 \\ -1 & 1 \end{bmatrix}
$$

and watch the whole plane transform under it. Splitting the screen into a
domain panel $\mathcal{U}$ and a codomain panel $\mathcal{V}$, we send a
rainbow cloud of points from $\mathcal{U}$ across to $\mathcal{V}$ — the
color of each point tracks its original position, so you can watch the
transformation without losing track of *where things came from*.

Because $A$ is invertible, the map is one-to-one and onto: nothing new
appears in $\mathcal{V}$ that wasn't reachable, and nothing collapses. The
range of $A$ is all of $\mathcal{V}$, and the null space is just the single
point at the origin — the origin is the *only* vector that maps to zero,
since $A$ never squashes any direction flat. That's the whole story for an
invertible matrix: an invertible transpose has nothing new to show either,
so there's no need to separately dig into components or $A^T$ here — that
richer structure only shows up once a map isn't invertible.

## Example 2: A singular transformation

Now consider

$$
A = \begin{bmatrix} 1 & 3 \\ 0.5 & 1.5 \end{bmatrix}
$$

whose columns are linearly dependent (the second column is exactly 3 times
the first). Transforming the plane collapses it down to a single line — this
is the full template for a singular map, run in five stages.

**Range and null space.** Mapping the rainbow cloud from $\mathcal{U}$ to
$\mathcal{V}$ again, every point lands somewhere on one line through the
origin in $\mathcal{V}$: the range of $A$, spanned by $(2, 1)$. The null
space is the set of points $\mathcal{U}$ that get crushed to zero — another
line, spanned by $(3, -1)$.

**Components.** Take a point not on either of those special lines, say
$(1, 1)$, which maps to $A(1,1) = (4, 2)$ in $\mathcal{V}$. Every point can
be split into a **row-space component** (along $(1, 3)$, the row space of
$A$ — equivalently the range of $A^T$) and a **null-space component** (along
the null-space direction $(3, -1)$). Since the null-space component always
maps to zero, the original point and its row-space component alone map to
the *exact same place* in $\mathcal{V}$ — you can drop the null-space piece
entirely and lose nothing. Push this further: fan a whole line of points out
along the null-space direction, all passing through that same row-space
component, and every single one of them maps to that one point in
$\mathcal{V}$.

**Turning around: $A^T$.** Now look at

$$
A^T = \begin{bmatrix} 1 & 0.5 \\ 3 & 1.5 \end{bmatrix}
$$

by swapping the two panels' roles — $\mathcal{V}$ becomes the domain and
$\mathcal{U}$ becomes the codomain. Its range is the row space of $A$ (the
same $(1,3)$ line, now living in $\mathcal{U}$ as a *destination* rather
than a component direction), and its null space is a new line in
$\mathcal{V}$, spanned by $(1, -2)$ — the **left null space** of $A$.

**Orthogonality.** With the panels swapped back, each panel now holds two
of the four subspaces at once, drawn in different colors: in $\mathcal{U}$,
the null space and the row space; in $\mathcal{V}$, the range and the left
null space. In both panels, the two lines meet at a right angle — the null
space is always orthogonal to the row space, and the range is always
orthogonal to the left null space.

## Example 3: A rank-2 map from $\mathbb{R}^3$ to $\mathbb{R}^3$

The same four subspaces show up for a bigger matrix, deliberately chosen to
be rank-2 (its columns are linearly dependent) so every subspace direction
stays a clean, small integer vector:

$$
A = \begin{bmatrix} 1 & 1 & 2 \\ 0 & 1 & 1 \\ -1 & 0 & -1 \end{bmatrix}
$$

Since domain and codomain are both 3-D here, we skip straight to the
two-panel view rather than transforming one shared grid. A single point,
$(1, 1, 0)$, maps to $(2, 1, -1)$; a full rainbow cloud reveals that the
range of $A$ isn't all of $\mathcal{V}$ but a 2-D *plane*, spanned by
$(1, 0, -1)$ and $(1, 1, 0)$. The null space is a line through
$(1, 1, -1)$ in $\mathcal{U}$.

Turning around to $A^T$: the row space of $A$ is now a plane in
$\mathcal{U}$, spanned by $(1, 1, 2)$ and $(0, 1, 1)$, and the left null
space is a line in $\mathcal{V}$ through $(1, -1, 1)$ — again orthogonal to
the range plane, exactly as the null space is orthogonal to the row-space
plane in $\mathcal{U}$. (With everything now a mix of planes and lines in
3-D, we skip the component-decomposition exercise from Example 2 — seeing a
projection onto a plane cleanly needs more visual machinery than this video
sets up — but every panel keeps rotating as new content appears, so the
3-D relationships stay legible rather than flattening into an ambiguous 2-D
silhouette.)
