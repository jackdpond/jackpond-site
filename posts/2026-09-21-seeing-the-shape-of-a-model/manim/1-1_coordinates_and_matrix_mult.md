# Bases, Coordinates, and Matrix-Vector Multiplication

*Companion notes for the "Bases and Matrices" slideshow. Section numbers below
match the slideshow's own sections; each subsection corresponds to one click
through the presentation, so you can follow along in either direction.*

## 1. Coordinate systems

**Clicks 1–3.** We start with a vector, $(2, 3)$, drawn in the plane. This
notation is one we're all familiar with — but it quietly assumes a particular
*basis*, or coordinate system. To make that assumption visible, we draw in the
standard basis vectors $e_1$ and $e_2$ alongside it.

**Clicks 4–7.** Concretely, $(2, 3)$ means:

$$
\begin{bmatrix} 2 \\ 3 \end{bmatrix} = 2 \begin{bmatrix} 1 \\ 0 \end{bmatrix} + 3 \begin{bmatrix} 0 \\ 1 \end{bmatrix}
$$

Each slot in the vector pairs with one basis vector — the first coordinate
scales $e_1$, the second scales $e_2$. It's tempting to think of the
coordinates *as* the vector, but the vector is really the coordinates
together with the (usually implicit) basis they're written against.

**Clicks 9–12.** Change the basis, keep the coordinates fixed, and you get a
genuinely different vector. Watching $(2, 3)$ ride along as $e_1$ and $e_2$
morph through three different bases —

$$
(e_1, e_2) = ((2,1),\,(4,3)) \;\to\; ((-1,1),\,(3,-2)) \;\to\; ((0.5,1),\,(1,-0.5))
$$

— makes this concrete: the *coordinates* $(2,3)$ never change, but the arrow
they describe moves all over the plane. We'll return to what makes one basis
"nicer" to work with than another later in the course.

**Clicks 12–14.** Basis vectors don't have to be linearly independent. If
$e_1$ and $e_2$ are chosen to point along the same line — here $(2, 1)$ and
$(3, 1.5)$ — their span collapses to one dimension, and *no* choice of
coordinates can escape that line. Sliding the first coordinate through
$0 \to 4$ and then the second through $1 \to 5$ shows the vector sweeping back
and forth, but always confined to the same 1-D span.

## 2. Matrix-vector multiplication

**Clicks 16–17.** This conversation about bases connects directly to
matrix-vector multiplication. Take:

$$
\begin{bmatrix} 4 & 1 \\ 1 & 3 \end{bmatrix} \begin{bmatrix} -1 \\ 2 \end{bmatrix}
$$

The key idea: matrix-vector multiplication is a *linear combination of the
matrix's columns*, weighted by the vector's entries:

$$
\begin{bmatrix} 4 & 1 \\ 1 & 3 \end{bmatrix} \begin{bmatrix} -1 \\ 2 \end{bmatrix} = -1\begin{bmatrix} 4 \\ 1 \end{bmatrix} + 2\begin{bmatrix} 1 \\ 3 \end{bmatrix}
$$

**Clicks 18–20.** Here's another way to see the same fact. On its own, the
vector $(-1, 2)$ is really shorthand for a combination of the *standard*
basis vectors:

$$
\begin{bmatrix} -1 \\ 2 \end{bmatrix} = -1\begin{bmatrix} 1 \\ 0 \end{bmatrix} + 2\begin{bmatrix} 0 \\ 1 \end{bmatrix}
$$

Multiplying by the matrix swaps in the matrix's *columns* in place of the
standard basis vectors — column $i$ answers "where does $e_i$ go?":

$$
\begin{bmatrix} 4 & 1 \\ 1 & 3 \end{bmatrix} \begin{bmatrix} -1 \\ 2 \end{bmatrix} = -1\begin{bmatrix} 4 \\ 1 \end{bmatrix} + 2\begin{bmatrix} 1 \\ 3 \end{bmatrix}
$$

**Clicks 21–22.** Carrying out the arithmetic:

$$
-1\begin{bmatrix} 4 \\ 1 \end{bmatrix} + 2\begin{bmatrix} 1 \\ 3 \end{bmatrix} = \begin{bmatrix} -2 \\ 5 \end{bmatrix} = -2\begin{bmatrix} 1 \\ 0 \end{bmatrix} + 5\begin{bmatrix} 0 \\ 1 \end{bmatrix}
$$

Importantly, this is *not* a change of coordinates — the coordinates
$(-1, 2)$ stay exactly the same throughout. What changes is which vectors
those coordinates are measured against.

## 3. Transformations

**Clicks 23–24.** Multiplying every vector in the plane by the same matrix is
a *linear transformation* — and it's easiest to see by watching the whole
grid move at once. Applying

$$
A = \begin{bmatrix} 4 & 1 \\ 1 & 3 \end{bmatrix}
$$

to the plane drags the background grid lines along with it (they visibly
skew, since that's the whole point), while $(-1, 2)$ and the basis vectors
ride along, landing at $(-2, 5)$ — matching the arithmetic from Section 2.

**Clicks 25–28.** What happens when the matrix's columns are linearly
dependent, as in

$$
B = \begin{bmatrix} 1 & 3 \\ \tfrac{1}{2} & \tfrac{3}{2} \end{bmatrix}
$$

? Applying $B$ to the plane collapses every vector — regardless of its
starting coordinates — onto a single line, the one-dimensional span of $B$'s
columns. A linearly dependent set of columns can't do anything else: there's
simply no direction left to escape into.
