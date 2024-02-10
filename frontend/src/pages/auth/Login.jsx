import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Button, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { apiAuth } from "../../services/models/authModel";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import { apiProvider } from "../../services/utilities/provider";
import { CustomLoaderButton } from "../../components/CustomButtons";
import { CustomPwdField } from "../../components/CustomInputFields";
const Login = () => {
  let [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    const userToken = localStorage.getItem("MockAPI-Token");
    const headers = {
      "auth-token": `${userToken}`,
    };
    axios
      .get("https://mocker-backend.vercel.app/api/auth/verify", {
        headers,
      })
      .then((res) => {
        if (res.data.message === "ok") {
          setHasToken(true);
        }
      })
      .catch((err) => {
        setHasToken(false);
      });
  }, []);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    email: "",
    password: "",
    submit: null,
  }; // form field value validation schema

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Must be a valid email")
      .max(255)
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Minimum 6 characters required")
      .required("Password is required"),
  });

  const { errors, values, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit: (values) => {
        setLoading(true);
        loginUser(values.email, values.password);
      },
    });

  const loginUser = (email, password) => {
    const body = {
      email: email,
      password: password,
    };

    apiAuth.post(body, "signin").then((res) => {
      if (res.status === "200") {
        if (!res.message.emailVerified) {
          toast.error(
            "Email not verified yet !. Please check you inbox for verification"
          );
          setLoading(false);
          return;
        }
        localStorage.setItem("MockAPI-Token", res.message.token);
        apiProvider.updateToken();
        navigate(`/dashboard/${res.message.userId}`);
        toast.success("Login successful");
      } else if (res.status === "400") {
        toast.error(res.message);
      } else {
        toast.error("Error");
      }
      setLoading(false);
    });
  };
  const logout = () => {
    localStorage.clear();
    setHasToken(false);
    navigate("/");
  };
  if (hasToken) {
    return (
      <Button variant="contained" onClick={logout} sx={{ mt: 4 }}>
        Logout
      </Button>
    );
  }
  return (
    <React.Fragment>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Login
      </Typography>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit}
        style={{
          width: "100%"
        }}
      >
        <TextField
          label="email"
          size="small"
          type="email"
          sx={{ mb: 2 }}
          fullWidth
          name="email"
          onBlur={handleBlur}
          onChange={handleChange}
          value={values.email || ""}
          error={Boolean(touched.email && errors.email)}
          helperText={touched.email && errors.email}
        />
        <CustomPwdField
          handleBlur={handleBlur}
          handleChange={handleChange}
          values={values}
          touched={touched}
          errors={errors}
        />
        <Button
          variant="contained"
          sx={{ display: "block", mt: 2, mx: "auto"}}
          type="submit"
          disabled={loading}
        >
          {loading ? <CustomLoaderButton /> : "Login"}
        </Button>
        <Typography variant="h6" component="p">
          {/*  eslint-disable-next-line react/no-unescaped-entities */}
          Don't have an account ? Then{"  "}
          <Link to="/signup" style={{ color: "deepskyblue" }}>
            Signup
          </Link>
        </Typography>
        <Typography variant="h6" component="p">
          <Link to="/reset-password" style={{ color: "deepskyblue" }}>
            Forgot password ?
          </Link>
        </Typography>
      </Box>
    </React.Fragment>
  );
};

export default Login;
