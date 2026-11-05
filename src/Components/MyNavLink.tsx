import { ComponentProps } from "react";
import { NavLink, useLocation, useResolvedPath } from "react-router-dom";

type Props = Omit<ComponentProps<typeof NavLink>, "to"> & { to: string };
export default function MyNavLink({ to, ...props }: Props) {
    const location = useLocation();
    const target = useResolvedPath(to);
    const search = new URLSearchParams(target.search);
    new URLSearchParams(location.search).forEach((value, key) => { if (!search.has(key)) search.set(key, value); });
    return <NavLink to={{ ...target, search: search.toString() ? `?${search}` : "" }} {...props} />;
}
