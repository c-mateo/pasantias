import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
// import './form.css';
import { CargarEmpresa } from "../components/CargarEmpresa";
import { CursoListDemo } from "../components/Course";
import UsersTable from "~/components/usuarios";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <UsersTable />
    // value={{
    //   name: "Empresa Ejemplo",
    //   email: "email@a.com",
    //   phone: "123456789",
    //   address: "Calle Falsa 123",
    //   website: "https://example.com",
    //   description: "Descripción de la empresa ejemplo",
    //   logo: "https://via.placeholder.com/150"
    // }}
    // />;
  // return <Empresa
  //   name="Empresa Ejemplo"
  //   email="test"
  //   phone="123456789"
  //   address="Calle Falsa 123"
  //   website="https://example.com"
  //   description="Descripción de la empresa ejemplo"
  //   logo="https://via.placeholder.com/150"
  // />;
}
