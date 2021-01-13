import Vue from "vue";
import Vuex from "vuex";
import router from "../router";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    error: {
      tipo: null,
      mensaje: "",
    },
    user: {
      email: "",
      password: "",
      role: "",
      nombre: "",
      apellidos: "",
    },
    proveedor: {
      nombre: "",
      laboratorio: {},
      numero: 0,
    },
    proveedores: [],
    laboratorio: {
      nombre: "",
    },
    laboratorios: [],
    compras: [],
    inventario: [],
    medicamentos: [],
    medicamento: {
      id: "",
      nombre: "",
      cantidad: 1,
      precio: 1,
      vencimiento: new Date(),
      lote: "",
    },
  },
  mutations: {
    setError(state, payload) {
      // RESTART
      if (payload === null) {
        return (state.error = { tipo: null, mensaje: "" });
      }
      // LOGIN
      else if (payload === "EMAIL_NOT_FOUND") {
        return (state.error = {
          tipo: "email",
          mensaje: "Correo electronico no encontrado",
        });
      }

      // LOGIN
      else if (payload === "INVALID_PASSWORD") {
        return (state.error = {
          tipo: "password",
          mensaje: "Contraseña no válida",
        });
      }
      //LOGIN
      else if (payload === "USER_DISABLED") {
        return (state.error = {
          tipo: "password",
          mensaje:
            "La cuenta de usuario ha sido inhabilitada por un administrador",
        });
      } else if (
        payload ===
        "TOO_MANY_ATTEMPTS_TRY_LATER : Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later."
      ) {
        return (state.error = {
          tipo: "attempts",
          mensaje: "Demasiados intentos de ingreso, intente mas tarde",
        });
      }
      // REGISTER
      else if (payload === "EMAIL_EXISTS") {
        return (state.error = {
          tipo: "email",
          mensaje: "Correo electronico ya registrado",
        });
      }
      // REGISTER
      else if (payload === "INVALID_EMAIL") {
        return (state.error = {
          tipo: "email",
          mensaje: "Formato email no válido",
        });
      } else if (payload === "Auth token is expired") {
        state.user = null;
        router.push("/login");
        localStorage.removeItem("user");

        return (state.error = {
          tipo: "time",
          mensaje: "La sesion a terminado, vuelva a ingresar",
        });
      } else if (payload === "CAMPO_MEDICAMENTO_INCORRECTO") {
        return (state.error = {
          tipo: "field",
          mensaje: "Campo de nombre de medicamento no llenado correctamente",
        });
      }
      console.log(state.error.message);
    },
    setUser(state, payload) {
      state.user = payload;
      localStorage.setItem("user", JSON.stringify(payload));
    },
    setCompras(state, payload) {
      state.compras = payload;
    },
    setProveedores(state, payload) {
      state.proveedores = payload;
    },
    setLaboratorios(state, payload) {
      state.laboratorios = payload;
    },
    setMedicamentos(state, payload) {
      state.medicamentos = payload;
    },
    setInventario(state, payload) {
      state.inventario = payload;
    },
  },
  actions: {
    async iniciarSesion({ commit, state }, user) {
      try {
        const res = await fetch(
          "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCh37mmPaCWQF2osXVXPpWQ02kNz2YWMP0",
          {
            method: "POST",
            body: JSON.stringify({
              email: user.email,
              password: user.password,
              returnSecureToken: true,
            }),
          }
        );

        const dataDB = await res.json();

        console.log(dataDB);

        if (dataDB.error) {
          console.log(dataDB.error.message);
          return commit("setError", dataDB.error.message);
        }
        commit("setUser", dataDB);
        console.log("inicio");
        console.log(state.user);
        router.push("/");
      } catch (error) {
        console.log(error);
      }
    },
    cerrarSesion({ commit }) {
      commit("setUser", null);
      router.push("/login");
      localStorage.removeItem("user");
    },
    setError({ commit }, error) {
      if (error.tipo !== null && error.mensaje !== "") {
        commit("setError");
      }
    },
    verificarDatosAlmacenados({ commit, state }) {
      if (localStorage.getItem("user")) {
        // console.log("local",localStorage.getItem("user"));
        commit("setUser", JSON.parse(localStorage.getItem("user")));
        router.push("/");
      } else {
        commit("setUser", null);
      }
    },
    async cargarCompras({ commit, state }) {
      if (localStorage.getItem("user")) {
        commit("setUser", JSON.parse(localStorage.getItem("user")));
      } else {
        return commit("setUser", null);
      }

      try {
        const res = await fetch(
          `https://farmaxip-default-rtdb.firebaseio.com/compras.json?auth=${state.user.idToken}`
        );
        const dataDB = await res.json();
        const arrayCompras = [];

        if (dataDB.error) {
          //console.log(dataDB);
          return commit("setError", dataDB.error);
        }

        for (let id in dataDB) {
          //console.log(id);
          //console.log(dataDB[id]);
          arrayCompras.push(dataDB[id]);
        }
        console.log(arrayCompras);
        commit("setCompras", arrayCompras);
      } catch (error) {
        console.log(error);
      }
    },
    añadirMedicamentoLista({ commit, state }) {
      state.medicamentos.push(state.medicamento);
      state.medicamento = {
        id: "",
        nombre: "",
        cantidad: 1,
        precio: 1,
        vencimiento: new Date(),
        lote: "",
      };
    },
    actualizarMedicamentoLista({ commit, state }, checkedRows) {
      console.log("entro");
      commit(
        "setMedicamentos",

        state.medicamentos.filter(function(e) {
          return this.indexOf(e) < 0;
        }, checkedRows)
      );
    },
    async cargarProveedores({ commit, state }) {
      if (localStorage.getItem("user")) {
        commit("setUser", JSON.parse(localStorage.getItem("user")));
      } else {
        return commit("setUser", null);
      }

      try {
        const res = await fetch(
          `https://farmaxip-default-rtdb.firebaseio.com/proveedor.json?auth=${state.user.idToken}`
        );
        const dataDB = await res.json();
        const arrayProveedores = [];

        if (dataDB.error) {
          //console.log(dataDB);
          return commit("setError", dataDB.error);
        }

        for (let id in dataDB) {
          //console.log(id);
          //console.log(dataDB[id]);
          arrayProveedores.push(dataDB[id]);
        }
        console.log(arrayProveedores);
        commit("setProveedores", arrayProveedores);
      } catch (error) {
        console.log(error);
      }
    },
    async cargarLaboratorios({ commit, state }) {
      if (localStorage.getItem("user")) {
        commit("setUser", JSON.parse(localStorage.getItem("user")));
      } else {
        return commit("setUser", null);
      }

      try {
        const res = await fetch(
          `https://farmaxip-default-rtdb.firebaseio.com/laboratorio.json?auth=${state.user.idToken}`
        );
        const dataDB = await res.json();
        const arrayLaboratorios = [];

        if (dataDB.error) {
          //console.log(dataDB);
          return commit("setError", dataDB.error);
        }

        for (let id in dataDB) {
          //console.log(id);
          //console.log(dataDB[id]);
          arrayLaboratorios.push(dataDB[id]);
        }
        console.log(arrayLaboratorios);
        commit("setLaboratorios", arrayLaboratorios);
      } catch (error) {
        console.log(error);
      }
    },
    async cargarInventario({ commit, state }) {
      if (localStorage.getItem("user")) {
        commit("setUser", JSON.parse(localStorage.getItem("user")));
      } else {
        return commit("setUser", null);
      }

      try {
        const res = await fetch(
          `https://farmaxip-default-rtdb.firebaseio.com/inventario.json?auth=${state.user.idToken}`
        );
        const dataDB = await res.json();
        const arrayInventario = [];

        if (dataDB.error) {
          //console.log(dataDB);
          return commit("setError", dataDB.error);
        }

        for (let id in dataDB) {
          //console.log(id);
          //console.log(dataDB[id]);
          arrayInventario.push(dataDB[id]);
        }
        console.log(arrayInventario);
        commit("setInventario", arrayInventario);
      } catch (error) {
        console.log(error);
      }
    },
  },
  modules: {},
  getters: {
    usuarioAutenticado(state) {
      try {
        if (state.user.registered) {
          return state.user.registered;
        } else {
          return false;
        }
      } catch (error) {
        console.log("dad");
        return false;
      }
    },
    
  },
});
