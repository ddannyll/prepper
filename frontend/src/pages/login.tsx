import CustomForm from "@/components/inputs/CustomForm";
const SignUpPage = () => {
  return (
    <div>
      <CustomForm
        inputs={[
          {
            label: "username",
            name: "username",
          },

          {
            label: "password",
            name: "password",
          },
        ]}
      />
    </div>
  );
};

export default SignUpPage;
