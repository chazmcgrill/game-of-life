import React, { Component } from 'react';
import Controls from './components/Controls';
import LifeBoard from './components/LifeBoard';
import SpeedControls from './components/SpeedControls';

const cellStatus = {
  DEAD: 0,
  YOUNG: 1,
  OLD: 2
}

interface Cell {
    cellStatus: number;
    id: number;
}

interface State {
    boardSize: number,
    cells: Cell[],
    paused: boolean,
    counter: number,
    delay: number
}

class App extends Component<{}, State> {
    public state: State = {
        boardSize: 1600,
        cells: [],
        paused: false,
        counter: 0,
        delay: 400
    }

    componentDidMount() {
        const cells = this.newCells();
        this.setState({ cells }, () => this.initialStatus());
    }

    lifecycleTimer = (delay: number): void => {
        if (!this.state.paused) {
            setTimeout(this.cellsLifecycle, delay);
        }
    }

    cellsLifecycle = (): void => {
        let prevCells = this.state.cells.slice();
        let { counter } = this.state;
        counter++;

        function checkNeighbours(index: number, currentState: number): number {
            const width = 40;
            const leftEdge = index % width === 0;
            const rightEdge = (index + 1) % width === 0;
            let indexs = [];

            // check either sides
            if (!leftEdge) indexs.push(index - 1);
            if (!rightEdge) indexs.push(index + 1);

            // check three cells above
            if (index > width - 1) {
                indexs.push(index - width);
                if (!leftEdge) indexs.push((index - width) - 1);
                if (!rightEdge) indexs.push((index - width) + 1);
            }

            // check three cells below
            if (index < (prevCells.length - width) - 1) {
                indexs.push(index + width);
                if (!leftEdge) indexs.push((index + width) - 1);
                if (!rightEdge) indexs.push((index + width) + 1);
            }

            // find the amount of neigbours
            const neighbours = indexs.filter(i => (prevCells[i].cellStatus !== cellStatus.DEAD)).length;

            // return new state depending on amount of neighbours
            if ((currentState !== cellStatus.DEAD && neighbours > 3) || neighbours < 2) {
                return cellStatus.DEAD;
            } else if (currentState === cellStatus.DEAD && neighbours === 3) {
                return cellStatus.YOUNG;
            } else if (currentState !== cellStatus.DEAD) {
                return cellStatus.OLD;
            } else {
                return cellStatus.DEAD;
            }

        }

        // Create new array of cells
        const cells = this.state.cells.map((cell) => {
            return { ...cell, cellStatus: checkNeighbours(cell.id, cell.cellStatus) }
        });

        this.setState({ cells, counter });
    }

    newCells = () => {
        const { boardSize } = this.state;
        return Array.apply(null, Array(boardSize)).map((cell, index) => {
            return { id: index, cellStatus: cellStatus.DEAD }
        })
    }

    initialStatus() {
        const cells = this.state.cells.map(cell => {
            return { ...cell, cellStatus: Math.floor(Math.random() * 2) }
        });
        this.setState({ cells });
    }

    handleReset = () => {
        const resetFunc = () => {
            this.initialStatus();
            this.setState({ counter: 0 });
        }

        if (!this.state.paused) {
            this.setState({ paused: true });
            setTimeout(() => resetFunc(), 400);
        } else {
            resetFunc();
        }
    }

    handleSpeedChange = (delay: number) => {
        if (!this.state.paused) {
            this.setState({ paused: true });
            setTimeout(() => {
                this.setState({ paused: false, delay });
            }, 400);
        } else {
            this.setState({ delay });
        }
    }

    handleResume = () => {
        if (this.state.paused) {
            this.setState({ paused: false });
        }
    }

    handleCellClick = (id: number) => {
        let cells = this.state.cells.slice();
        cells[id].cellStatus = cells[id].cellStatus === cellStatus.YOUNG ? cellStatus.DEAD : cellStatus.YOUNG;
        this.setState({ cells });
    }

    handleClear = () => {
        const cells = this.newCells();
        this.setState({ cells, paused: true, counter: 0 });
    }

    render() {
        const { cells, counter, delay } = this.state;

        this.lifecycleTimer(delay);

        return (
            <div>
                <header>
                    <h1>Life</h1>
                </header>

                <Controls
                    onPlay={this.handleResume}
                    onPause={() => this.setState({ paused: true })}
                    onClear={this.handleClear}
                    onReset={this.handleReset}
                />

                {cells.length > 0 && <LifeBoard cells={cells} clickCell={this.handleCellClick} />}

                <p>Cell Lifecycles: {counter}</p>

                <SpeedControls handleSpeedChange={this.handleSpeedChange} />
                
                <p className="footer">coded by <a href="https://www.charlietaylorcoder.com">charlie taylor</a></p>
            </div>
        )
    }
}

export default App;
