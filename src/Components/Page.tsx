interface IProps {
    children: React.ReactNode;
}

function Page(props: IProps) {
    return (
      <div>
        <div>header</div>
        <div>{props.children}</div>
        <div>footer</div>
      </div>
      );
}

export default Page;
