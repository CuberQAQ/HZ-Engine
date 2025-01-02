import {
  Button,
  Container,
  Heading,
  Theme,
  ThemePanel,
} from "@radix-ui/themes";
declare const openProject: () => any
function Start() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Theme accentColor="iris" grayColor="olive">
        <Container size="3" align={"center"}>
          <Heading>HZ-Engine 启动器</Heading>
          <Button onClick={() => {
            openProject()
          }}>
            加载项目
          </Button>
        </Container>
        <ThemePanel />
      </Theme>
    </div>
  );
}

export default Start;
