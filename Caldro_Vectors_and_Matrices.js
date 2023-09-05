"use strict"; // Vectors_and_Matricies

class Lvector2D {
    static zero = () => {
        return new Lvector2D(0, 0)
    }
    static copy = (vector) => {
        return new Lvector2D(vector.x, vector.y)
    }
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
    }
    multiply(number) {
        this.x *= number;
        this.y *= number;
    }
    divide(number) {
        if (number) {
            this.x /= number;
            this.y /= number;
        }
        console.error("vector is being divided by an unsusual variable: " + number)
    }
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2)
    }
    magnitude(){
        return this.length()
    }
    magnitudeSqr(){
        return (this.x ** 2 + this.y ** 2)
    }
    normalize(sourceVector = originVector) {
        let mag = dist2D(this, sourceVector);
        mag = mag == 0 ? 1 : mag;
        this.x /= mag;
        this.y /= mag;
    }
    copy(vector){
        this.x = vector.x;
        this.y = vector.y;
    }
}

class Lvector3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class vector2D {
    static zero = new vector2D(0, 0)
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    normalize(sourceVector = originVector) {
        let mag = dist2D(this, sourceVector);
        mag = mag == 0 ? 1 : mag;
        return new vector2D(this.x /= mag, this.y /= mag)
    }
    magnitude(sourceVector = originVector) {
        return dist2D(this, sourceVector)
    }
    subtract(vector = originVector) {
        return new vector2D(this.x - vector.x, this.y - vector.y)
    }
    add(vector = originVector) {
        return new vector2D(this.x + vector.x, this.y + vector.y)
    }
    multiply(number = 1) {
        return new vector2D(this.x *= number, this.y *= number)
    }
    divide(number = 1) {
        if (number) {
            return new vector2D(this.x /= number, this.y /= number)
        }
        console.error("vector is being divided by an unsusual variable: " + number)
    }
    normal() {
        return new vector2D(-this.y, this.x);
    }
    invert() {
        return new vector2D(-this.x, -this.y)
    }
    isSameAs(vector) {
        return (this.x == vector.x && this.y == vector.y)
    }
}


const vecMath = {
    normalize(vector, sourceVector = originVector) {
        let mag = this.distance(vector, sourceVector);
        mag = mag == 0 ? 1 : mag;
        return new Lvector2D(vector.x / mag, vector.y / mag)
    },
    lengthSquared(vector) {
        return (vector.x ** 2 + vector.y ** 2)
    },
    distanceSquared(vector1, vector2) {
        let dx = vector1.x - vector2.x
        let dy = vector1.y - vector2.y
        return ((dx ** 2) + (dy ** 2))
    },
    length(vector) {
        return Math.sqrt(vector.x ** 2 + vector.y ** 2)
    },
    distance(vector1, vector2) {
        let dx = vector1.x - vector2.x
        let dy = vector1.y - vector2.y
        return Math.sqrt((dx ** 2) + (dy ** 2))
    },
    normal(vector) {
        return new Lvector2D(-vector.y, vector.x);
    },
    invert(vector) {
        return new Lvector2D(-vector.x, -vector.y)
    },
    equal(vector1, vector2, marginOfError = 0) {
        if (!marginOfError) {
            return (vector1.x == vector2.x && vector1.y == vector2.y)
        }
        return vecMath.distanceSquared(vector1, vector2) < marginOfError ** 2;
    },

    add(vector1, vector2) {
        return new Lvector2D(vector1.x + vector2.x, vector1.y + vector2.y)
    },
    subtract(vector1, vector2) {
        return new Lvector2D(vector1.x - vector2.x, vector1.y - vector2.y)
    },
    multiply(vector, number) {
        return new Lvector2D(vector.x * number, vector.y * number)
    },
    divide(vector, number) {
        if (number) {
            return new Lvector2D(vector.x / number, vector.y / number)
        }
        console.error("vector is being divided by an unsusual variable: " + number)
    },

    transform(vector, transform) {
        return new Lvector2D(
            transform.cos * vector.x - transform.sin * vector.y + transform.positionX,
            transform.sin * vector.x + transform.cos * vector.y + transform.positionY
        )

        let rx = transform.cos * vector.x - transform.sin * vector.y
        let ry = transform.sin * vector.x + transform.cos * vector.y

        let tx = rx + transform.positionX
        let ty = ry + transform.positionY

        return new Lvector2D(tx, ty)

    },
    copy(vector) {
        return new Lvector2D(vector.x, vector.y);
    },
    map(vector, f) {
        return new Lvector2D(f(vector.x), f(vector.y));
    },
    dot(vector1, vector2) {
        return vector1.x * vector2.x + vector1.y * vector2.y;
    },
    croos(vector1, vector2) {
        return vector1.x * vector2.y - vector1.y * vector2.x;
    },
}

const originVector = new vector2D(0, 0)

function array2D(rows = 2, columns = 2, initialValues = 0) {
    let arr2D = new Array();
    for (let r = 0; r < rows; ++r) {
        let Row = new Array();
        let value = initialValues
        for (let c = 0; c < columns; ++c) {
            if (typeof initialValues == "function") {
                value = initialValues(r, c)
            }
            Row.push(value)
        }
        arr2D.push(Row)
    }
    return arr2D;
}


class Matrix {
    static rowWise = 1;
    static columnWise = 2;
    constructor(rows, columns, initializer = 0) {
        this.rows = rows;
        this.columns = columns;
        this.data = new Array(this.rows);

        for (let i = 0; i < rows; ++i) {
            this.data[i] = new Array(columns);
            for (let j = 0; j < columns; ++j) {
                if (typeof initializer == "number") {
                    this.data[i][j] = initializer;
                } else if (typeof initializer == "function") {
                    this.data[i][j] = initializer(i, j);
                }
            }
        }
    }

    addRow(array) {
        if (array.length == this.columns) {
            this.data.push(array.splice(0, array.length))
            ++this.columns
        }
    }
    addColumn(array) {
        if (array.length == this.rows) {
            for (let i = 0; i < this.rows; ++i) {
                this.data[i].push(array[i])
            }
            ++this.rows;
        }
    }

    sum(direction = Matrix.rowWise) {
        if (direction == Matrix.rowWise) {
            let sumArray = new Array(this.columns)
            sumArray.fill(0)
            for (let i = 0; i < this.rows; ++i) {
                for (let j = 0; j < this.columns; ++j) {
                    sumArray[j] += this.data[i][j]
                }
            }
            return sumArray
        } else if (direction == Matrix.columnWise) {
            let sumArray = new Array(this.rows)
            sumArray.fill(0)
            for (let i = 0; i < this.rows; ++i) {
                for (let j = 0; j < this.columns; ++j) {
                    sumArray[i] += this.data[i][j]
                }
            }
            return sumArray
        }
    }

    copy() {
        let m = new Matrix(this.rows, this.columns);
        for (let i = 0; i < this.rows; ++i) {
            for (let j = 0; j < this.columns; ++j) {
                m.data[i][j] = this.data[i][j]
            }
        }
        return m;
    }

    static createFromArray(array, direction = Matrix.rowWise) {
        if (direction == Matrix.rowWise) {
            let mat = new Matrix(array.length, 1);
            for (let i = 0; i < array.length; ++i) {
                mat.data[i][0] = array[i];
            }
            // if it's a 2D array
            // let mat = new Matrix(array[0].length, array.length);
            // for (let i = 0; i < array.length; ++i) {
            // for (let j = 0; j < array[0].length; ++j) {
            // mat.data[i][j] = array[i]j];
            // }
            // }
            return mat;
        }
        if (direction == Matrix.columnWise) {
            let mat = new Matrix(1, array.length);
            mat.data[0] = array
            // if it's a 2D array
            // let mat = new Matrix(array.length, array[0].length);
            // for (let i = 0; i < array[0].length; ++i) {
            // mat.data[i] = array[i];
            // }
            return mat;
        }
    }

    toArray(direction = Matrix.rowWise) {
        let array = new Array();
        for (let r = 0; r < this.rows; ++r) {
            for (let c = 0; c < this.columns; ++c) {
                if (direction == Matrix.rowWise) {
                    array.push(this.data[r][c])
                } else if (direction == Matrix.columnWise) {
                    array.push(this.data[c][r])
                }
            }
        }
        return array;
    }

    map(action) {
        for (let r = 0; r < this.rows; ++r) {
            for (let c = 0; c < this.columns; ++c) {
                this.data[r][c] = action(this.data[r][c], r, c)
            }
        }
    }

    static map(matrix, action) {
        let result = new Matrix(matrix.rows, matrix.columns);
        for (let r = 0; r < result.rows; ++r) {
            for (let c = 0; c < result.columns; ++c) {
                result.data[r][c] = action(matrix.data[r][c], r, c)
            }
        }
        return result
    }

    print(text = null) {
        if (text) {
            console.log(text);
        }
        console.table(this.data);
    }

    randomize(min = 0, max = 1, isFloat = true) {
        for (let r = 0; r < this.rows; ++r) {
            for (let c = 0; c < this.columns; ++c) {
                this.data[r][c] = randomNumber(min, max, isFloat)
            }
        }
    }

    transpose() {
        let result = new Matrix(this.columns, this.rows);
        for (let r = 0; r < this.rows; ++r) {
            for (let c = 0; c < this.columns; ++c) {
                result.data[c][r] = this.data[r][c];
            }
        }
        this.data = result.data;
    }

    static transpose(matrix) {
        let result = new Matrix(matrix.columns, matrix.rows);
        for (let r = 0; r < matrix.rows; ++r) {
            for (let c = 0; c < matrix.columns; ++c) {
                result.data[c][r] = matrix.data[r][c];
            }
        }
        return result;
    }

    multiply(n) {
        if (n instanceof Matrix) {
            for (let r = 0; r < this.rows; ++r) {
                for (let c = 0; c < this.columns; ++c) {
                    this.data[r][c] *= n.data[r][c];
                }
            }
            return;
        }
        for (let r = 0; r < this.rows; ++r) {
            for (let c = 0; c < this.columns; ++c) {
                this.data[r][c] *= n
            }
        }
    }

    static multiply(matA, matB) {
        if (matA.columns !== matB.rows) {
            console.error("Number of columns of A must match number of rows of B");
            return undefined;
        }

        let result = new Matrix(matA.rows, matB.columns)
        let a = matA.data;
        let b = matB.data;
        for (let r = 0; r < result.rows; ++r) {
            for (let c = 0; c < result.columns; ++c) {
                let sum = 0;
                for (let k = 0; k < matA.columns; ++k) {
                    sum += a[r][k] * b[k][c]
                }
                result.data[r][c] = sum;
            }
        }
        return result;
    }


    add(n) {
        if (n instanceof Matrix) {
            for (let r = 0; r < this.rows; ++r) {
                for (let c = 0; c < this.columns; ++c) {
                    this.data[r][c] += n.data[r][c];
                }
            }
            return;
        }
        for (let r = 0; r < this.rows; ++r) {
            for (let c = 0; c < this.columns; ++c) {
                this.data[r][c] += n
            }
        }
    }

    static add(matA, matB) {
        let result = new Matrix(matA.rows, matA.columns)
        for (let r = 0; r < result.rows; ++r) {
            for (let c = 0; c < result.columns; ++c) {
                result.data[r][c] = matA.data[r][c] + matB.data[r][c];
            }
        }
        return result;
    }
    static subtract(matA, matB) {
        let result = new Matrix(matA.rows, matA.columns)
        for (let r = 0; r < result.rows; ++r) {
            for (let c = 0; c < result.columns; ++c) {
                result.data[r][c] = matA.data[r][c] - matB.data[r][c];
            }
        }
        return result;
    }

    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(data) {
        if (typeof data == 'string') {
            data = JSON.parse(data);
        }
        let matrix = new Matrix(data.rows, data.columns);
        matrix.data = data.data;
        return matrix;
    }

    cellularAutomata(automata) {
        let newState = new Matrix(this.rows, this.columns, 0);
        for (let i = 0; i < newState.rows; ++i) {
            for (let j = 0; j < newState.columns; ++j) {
                let surroundingCells = this.getSurroundingCells(i, j, 1);
                newState.data[i][j] = automata(this.data[i][j], surroundingCells, i, j)
            }
        }
        this.data = newState.data
    }

    cellularAutomataM(automata) {
        let newState = new Matrix(this.rows, this.columns, 0);
        for (let i = 0; i < newState.rows; ++i) {
            for (let j = 0; j < newState.columns; ++j) {
                let surroundingCells = this.getSurroundingCellsMatrix(i, j, 1);
                newState.data[i][j] = automata(this.data[i][j], surroundingCells, i, j)
            }
        }
        this.data = newState.data
    }

    forSurroundingCells(row, column, span, action) {
        for (let i = row - span; i <= row + span; ++i) {
            for (let j = column - span; j <= column + span; ++j) {
                if (i == -1 || j == -1 || i > this.rows - 1 || j > this.columns - 1) continue;
                let data = this.data[i]
                if (data !== undefined) {
                    data = data[j]
                    if (!(i == row && j == column)) {
                        this.data[i][j] = action(this.data[i][j], i, j)
                    }
                }
            }
        }
    }

    getSurroundingCells(row, column, span = 1) {
        let cells = new Array()
        for (let i = row - span; i <= row + span; ++i) {
            for (let j = column - span; j <= column + span; ++j) {
                if (i <= -1 || j <= -1 || i > this.rows - 1 || j > this.columns - 1) continue;
                let data = this.data[i]
                if (data !== undefined) {
                    data = data[j]
                    if (data !== undefined) {
                        if (!(i == row && j == column)) {
                            cells.push(data)
                        }
                    }
                } else {
                    // console.log(i, j)
                }
            }
        }
        return cells;
    }

    getSurroundingCellsMatrix(row, column, span = 1) {
        let cells = new Matrix(span * 2 + 1, span * 2 + 1, 0)
        for (let i = row - span; i <= row + span; ++i) {
            for (let j = column - span; j <= column + span; ++j) {
                if (i <= -1 || j <= -1 || i > this.rows - 1 || j > this.columns - 1) continue;
                let data = this.data[i][j]
                let nRow = (span + i) - row
                let nCol = (span + j) - column
                if (!(i == row && j == column)) {
                    cells.data[nRow][nCol] = data
                }
            }
        }
        return cells;
    }
}

class Array2D {
    constructor(rows = 2, columns = 2, initialValues = 0) {
        this.data = new Array();
        this.rows = rows;
        this.columns = columns;
        for (let r = 0; r < rows; ++r) {
            let Row = new Array();
            let value = initialValues
            for (let c = 0; c < columns; ++c) {
                if (typeof initialValues == "function") {
                    value = initialValues()
                }
                Row.push(value)
            }
            this.data.push(Row)
        }
    }
    getRow(rowIndex) {
        return this.data[rowIndex]
    }
    getColumn(columnIndex) {
        let arr = new Array();
        for (let row = 0; row < this.data.length; ++row) {
            arr.push(this.data[row][columnIndex])
        }
        return arr;
    }
}

const matUtils = {
    transposeMatrix(matrix) {
        let newMat = new matrix2D(matrix.columns, matrix.rows)
        for (let r = 0; r < matrix.rows; ++r) {
            let row = matrix.mat[r];
            for (let c = 0; c < row.length; ++c) {
                let value = row[c];
                newMat.mat[c][r] = value
            }
        }
        return newMat;
    },
    transpose(matrix) {
        let rows = matrix.length;
        let cols = matrix[0].length;
        let newMat = array2D(cols, rows)
        for (let r = 0; r < rows; ++r) {
            let row = matrix[r];
            for (let c = 0; c < row.length; ++c) {
                let value = row[c];
                newMat[c][r] = value
            }
        }
        return newMat;
    },

    dotMatrix(matrixA, matrixB) {
        if (matrixA.rows != matrixB.columns) {
            console.error("Matrix error: can't perform matrix operation 'dotProduct' on matirces, shape error\nAmount of rows of matrix A and amount of columns of matrix B must be the same\nMatris A shapse (rows by columns): " + matUtils.getShape(matrixA.mat) + "\nMatix B shape (rows by columns): " + matUtils.getShape(matrixB.mat))
            return;
        }
        let mat = new matrix2D(matrixA.rows, matrixB.columns);
        for (let rowA = 0; rowA < matrixA.rows; ++rowA) {
            for (let colB = 0; colB < matrixB.columns; ++colB) {
                mat.mat[rowA][colB] = arrUtils.dot(matrixA.mat[rowA], matrixB.getColumn(colB))
            }
        }
        return mat
    },
    dot(matrixA, matrixB) {
        /*         if(matrixA.length != matrixB[0].length){
                    console.error("Matrix error: can't perform matrix operation 'dotProduct' on matirces, shape error\nAmount of rows of matrix A and amount of columns of matrix B must be the same\nMatris A shapse (rows by columns): "+matUtils.getShape(matrixA)+"\nMatix B shape (rows by columns): "+matUtils.getShape(matrixB))
                    return;    
                } */
        let rowsA = matrixA.length;
        let colsB = matrixB[0].length
        let mat = array2D(rowsA, colsB);
        for (let rowA = 0; rowA < rowsA; ++rowA) {
            for (let colB = 0; colB < colsB; ++colB) {
                mat[rowA][colB] = arrUtils.dot(matrixA[rowA], arrUtils.getArray2Dcols(matrixB, colB))
            }
        }
        return mat
    },
    add(matrixA, matrixB) {
        let arr = array2D(matrixB.length, matrixA[0].length);
        for (let r = 0; r < matrixA.length; ++r) {
            for (let c = 0; c < matrixB[0].length; ++c) {
                arr[r][c] = matrixA[r][c] + matrixB[c]
            }
        }
        return arr;
    },
    getShape(matrix) {
        return [matrix.length, matrix[0].length]
    }
    /*     shape(array){
        if(typeof array[0] == "number"){
            return array.length
        }
        return this.shape(array[0])
    } */
}

const arrUtils = {
    dot(array1, array2) {
        let ans = 0;
        for (let n = 0; n < array1.length; ++n) {
            ans += array1[n] * array2[n]
        }
        return ans;
    },
    sum(array, mapping) {
        let sum = 0;
        if (typeof mapping == "function") {
            for (let n = 0; n < array.length; ++n) {
                sum += mapping(array[n])
            }
            return sum;
        }
        for (let n = 0; n < array.length; ++n) {
            sum += array[n];
        }
        return sum;
    },
    add(array1, array2) {
        let ans = new Array()
        for (let n = 0; n < array1.length; ++n) {
            ans.push(array1[n] + array2[n])
        }
        return ans;
    },
    multiply(array1, array2) {
        let ans = new Array()
        for (let n = 0; n < array1.length; ++n) {
            ans.push(array1[n] * array2[n])
        }
        return ans;
    },
    mean(array) {
        return arraySum(array) / array.length;
    },
    min(array, specifier = null) {
        let min = INFINITY;
        for (let n = 0; n < array.length; ++n) {
            let value = array[n];
            if (specifier) {
                value = specifier(value)
            }
            min = Math.min(min, value)
        }
        return min
    },
    max(array, specifier = null) {
        let max = -INFINITY;
        for (let n = 0; n < array.length; ++n) {
            let value = array[n];
            if (specifier) {
                value = specifier(value)
            }
            max = Math.max(max, value)
        }
        return max
    },
    map(array, action) {
        let newArray = new Array(array.length)
        for (let n = 0; n < array.length; ++n) {
            newArray[n] = action(array[n]);
        }
        return newArray
    },
    copy(array) {
        return array.slice(0, array.length)
    },
    remove(array, element) {
        return array.filter((ArrayElement) => {
            return ArrayElement != element;
        })
    },
    getArray2Dcols(array, columnIndex) {
        let arr = new Array();
        for (let row = 0; row < array.length; ++row) {
            arr.push(array[row][columnIndex])
        }
        return arr;
    },
}