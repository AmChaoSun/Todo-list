import React, {
  useState,
  useMemo,
  useEffect,
  memo,
  useCallback,
  useRef,
  PureComponent
} from "react";
//import logo from "./logo.svg";
import "./App.css";
import { createAdd, createRemove, createSet, createToggle } from "./actions";
import reducer from "./reducers";

function bindActionCreators(actionCreators, dispatch) {
  const ret = {};

  for (let key in actionCreators) {
    ret[key] = function(...args) {
      const actionCreator = actionCreators[key];
      const action = actionCreator(...args);
      dispatch(action);
    };
  }

  return ret;
}

function Control(props) {
  const { addTodo } = props;
  const inputRef = useRef();
  const onSubmit = e => {
    e.preventDefault();
    const newText = inputRef.current.value.trim();
    if (newText.length === 0) {
      return;
    }
    addTodo(newText);
    inputRef.current.value = "";
  };
  return (
    <div className="control">
      <h1>todos</h1>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          className="new-todo"
          placeholder="What needs to be done?"
          ref={inputRef}
        />
      </form>
    </div>
  );
}

function TodoItem(props) {
  const {
    todo: { id, text, complete },
    removeTodo,
    toggleTodo
  } = props;
  const onChange = () => {
    toggleTodo(id);
  };
  const onRemove = () => {
    removeTodo(id);
  };
  return (
    <li className="todo-item">
      <input type="checkbox" onChange={onChange} checked={complete} />
      <label className={complete ? "complete" : ""}>{text}</label>
      <button onClick={onRemove}>&#xd7;</button>
    </li>
  );
}

function Todos(props) {
  const { todos, removeTodo, toggleTodo } = props;
  return (
    <ul>
      {todos.map(todo => {
        return (
          <TodoItem
            key={todo.id}
            todo={todo}
            removeTodo={removeTodo}
            toggleTodo={toggleTodo}
          />
        );
      })}
    </ul>
  );
}

const LS_KEY = "_$-todos_";

let store = {
  todos: [],
  incrementCount: 0
};

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [incrementCount, setIncrementCount] = useState(0);

  useEffect(() => {
    Object.assign(store, { todos, incrementCount });
  }, [todos, incrementCount]);

  const dispatch = action => {
    const setters = {
      todos: setTodos,
      incrementCount: setIncrementCount
    };
    if ("function" === typeof action) {
      action(dispatch, () => store);
      return;
    }

    const newState = reducer(store, action);
    for (let key in newState) {
      setters[key](newState[key]);
    }
  };

  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    dispatch(createSet(todos));
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(todos));
  }, [todos]);

  return (
    <div className="todo-list">
      <Control {...bindActionCreators({ addTodo: createAdd }, dispatch)} />
      <Todos
        {...bindActionCreators(
          { removeTodo: createRemove, toggleTodo: createToggle },
          dispatch
        )}
        todos={todos}
      />
    </div>
  );
}

export default TodoList;
