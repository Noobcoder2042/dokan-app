import { useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  Paper,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import { Close } from "@mui/icons-material";
import Fuse from "fuse.js";

const CustomerDetails = ({
  customerName,
  customerPhone,
  customerAddress,
  customerOptions,
  onNameChange,
  onPhoneChange,
  onAddressChange,
  onCustomerSelect,
  nameInputRef,
  phoneInputRef,
  addressInputRef,
  onNameKeyDown,
  onPhoneKeyDown,
  onAddressKeyDown,
}) => {
  const [customerPopupOpen, setCustomerPopupOpen] = useState(false);

  const customerInputRef = useRef(null);

  const normalize = (text = "") =>
    String(text)
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

  const normalizePhone = (value = "") =>
    String(value).replace(/[^\d]/g, "");

  const selectedCustomer =
    customerOptions.find(
      (option) => normalize(option.name) === normalize(customerName),
    ) || null;

  const exactPhoneMatch = useMemo(() => {
    const query = normalizePhone(customerPhone);
    if (!query) return null;
    return customerOptions.find(
      (option) => normalizePhone(option.phoneNumber) === query,
    );
  }, [customerPhone, customerOptions]);

  const exactNameAddressMatch = useMemo(() => {
    const nameQuery = normalize(customerName);
    const addressQuery = normalize(customerAddress);
    if (!nameQuery || !addressQuery) return null;
    return customerOptions.find(
      (option) =>
        normalize(option.name) === nameQuery &&
        normalize(option.address) === addressQuery,
    );
  }, [customerName, customerAddress, customerOptions]);

  const duplicateMessage = useMemo(() => {
    if (exactPhoneMatch) {
      if (normalize(exactPhoneMatch.name) !== normalize(customerName)) {
        return `Existing customer found for this phone: ${exactPhoneMatch.name}. Select it to reuse their details.`;
      }
      if (
        exactPhoneMatch.address &&
        normalize(exactPhoneMatch.address) !== normalize(customerAddress)
      ) {
        return `Phone matches existing customer ${exactPhoneMatch.name}. Their saved address is "${exactPhoneMatch.address}".`;
      }
      return `Phone matches existing customer ${exactPhoneMatch.name}.`;
    }

    if (exactNameAddressMatch) {
      return `Customer name and address already exist for ${exactNameAddressMatch.name}. Select it to avoid a duplicate.`;
    }

    return "";
  }, [exactPhoneMatch, exactNameAddressMatch, customerName, customerAddress]);

  const smartOptions = useMemo(() => {
    const source = [...customerOptions].sort(
      (a, b) => (b.lastUsed || 0) - (a.lastUsed || 0),
    );

    const query = customerName?.trim() || "";

    if (!query) return source.slice(0, 8);

    const numericQuery = query.replace(/[^\d]/g, "");

    const isPhoneQuery = numericQuery.length >= 3 && /^\d+$/.test(numericQuery);

    if (isPhoneQuery) {
      return source
        .filter((entry) =>
          (entry.phoneNumber || "")
            .replace(/[^\d]/g, "")
            .includes(numericQuery),
        )
        .slice(0, 10);
    }

    const fuse = new Fuse(source, {
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: "name", weight: 0.55 },
        { name: "phoneNumber", weight: 0.35 },
        { name: "address", weight: 0.1 },
      ],
    });

    const fuseResults = fuse.search(query).map((result) => result.item);

    const startsWithMatches = source.filter((entry) =>
      (entry.name || "").toLowerCase().startsWith(query.toLowerCase()),
    );

    const merged = [...startsWithMatches, ...fuseResults];

    const unique = Array.from(
      new Map(
        merged.map((entry) => [
          `${(entry.name || "").toLowerCase()}|${(
            entry.phoneNumber || ""
          ).toLowerCase()}`,
          entry,
        ]),
      ).values(),
    );

    return unique.slice(0, 10);
  }, [customerName, customerOptions]);

  const typoSuggestions = useMemo(() => {
    const query = (customerName || "").trim();

    if (query.length < 3) return [];

    const hasStrongMatch = smartOptions.some(
      (option) =>
        (option.name || "").toLowerCase() === query.toLowerCase() ||
        (option.name || "").toLowerCase().startsWith(query.toLowerCase()),
    );

    if (hasStrongMatch) return [];

    return smartOptions
      .filter((option) => !option.isNew && option.name)
      .map((option) => option.name)
      .filter((name, index, array) => array.indexOf(name) === index)
      .slice(0, 3);
  }, [customerName, smartOptions]);

  return (
    <>
      <Grid item xs={12} sx={{ position: "relative" }}>
        <Autocomplete
          freeSolo
          fullWidth
          open={customerPopupOpen}
          onOpen={() => setCustomerPopupOpen(true)}
          onClose={() => setCustomerPopupOpen(false)}
          options={smartOptions}
          value={selectedCustomer}
          inputValue={customerName}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.name || ""
          }
          isOptionEqualToValue={(option, value) => option.name === value.name}
          filterOptions={(options) => options}
          onInputChange={(event, value, reason) => {
            onNameChange(value);

            if (reason === "input") {
              setCustomerPopupOpen(!!value.trim());
            } else if (reason === "reset" || reason === "clear") {
              setCustomerPopupOpen(false);
            }
          }}
          onChange={(_, value) => {
            if (typeof value === "string") {
              onNameChange(value);
            } else if (value) {
              onCustomerSelect(value);
            }

            setCustomerPopupOpen(false);

            setTimeout(() => {
              customerInputRef.current?.blur();
            }, 50);
          }}
          PaperComponent={(paperProps) => {
            const { children, ...other } = paperProps;

            return (
              <Paper
                {...other}
                elevation={12}
                sx={{
                  borderRadius: "8px",
                  mt: 1,
                  border: "1px solid rgba(148, 163, 184, 0.12)",
                  overflow: "hidden",
                  boxShadow:
                    "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.25,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "grey.50",
                    borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Customer Suggestions
                  </Typography>

                  <IconButton
                    size="small"
                    onClick={() => {
                      setCustomerPopupOpen(false);
                      customerInputRef.current?.blur();
                    }}
                  >
                    <Close sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {children}
              </Paper>
            );
          }}
          renderOption={(props, option) => (
            <li {...props} style={{ padding: "8px 16px" }}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ width: "100%" }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "primary.light",
                    color: "primary.main",
                    opacity: 0.8,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {option.name?.[0]?.toUpperCase()}
                  </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    {option.name}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mt: 0.25 }}>
                    {option.phoneNumber && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <PhoneIphoneRoundedIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />

                        <Typography variant="caption" color="text.secondary">
                          {option.phoneNumber}
                        </Typography>
                      </Stack>
                    )}

                    {option.address && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationOnRoundedIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: 150 }}
                        >
                          {option.address}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Customer Name"
              placeholder="Search by name or phone"
              fullWidth
              inputRef={(el) => {
                customerInputRef.current = el;

                if (typeof nameInputRef === "function") {
                  nameInputRef(el);
                } else if (nameInputRef) {
                  nameInputRef.current = el;
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();

                  setCustomerPopupOpen(false);

                  setTimeout(() => {
                    customerInputRef.current?.blur();
                  }, 50);
                }

                onNameKeyDown?.(event);
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                },
              }}
            />
          )}
        />

        {customerPopupOpen && typoSuggestions.length ? (
          <Paper
            elevation={8}
            sx={{
              position: "absolute",
              left: 12,
              right: 12,
              top: "calc(100% + 6px)",
              zIndex: 1400,
              p: 1,
              borderRadius: "8px",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              backgroundColor: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", rowGap: 1 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ pt: 0.5 }}
              >
                Did you mean:
              </Typography>

              {typoSuggestions.map((name) => (
                <Chip
                  key={`suggest-${name}`}
                  size="small"
                  label={name}
                  onClick={() => {
                    // FIND FULL CUSTOMER OBJECT
                    const matchedCustomer = customerOptions.find(
                      (option) => normalize(option.name) === normalize(name),
                    );

                    // SAME BEHAVIOR AS AUTOCOMPLETE SELECT
                    if (matchedCustomer) {
                      onCustomerSelect(matchedCustomer);
                    } else {
                      onNameChange(name);
                    }

                    // CLOSE POPUP
                    setCustomerPopupOpen(false);

                    // BLUR INPUT
                    setTimeout(() => {
                      customerInputRef.current?.blur();
                    }, 50);
                  }}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Stack>
          </Paper>
        ) : null}
      </Grid>

      {duplicateMessage ? (
        <Grid item xs={12}>
          <Typography
            variant="body2"
            sx={{ color: "warning.main", mt: 0.5 }}
          >
            {duplicateMessage}
          </Typography>
        </Grid>
      ) : null}

      <Grid item xs={12} sm={6}>
        <TextField
          label="Customer Phone"
          placeholder="Enter customer phone"
          value={customerPhone}
          onChange={(event) => onPhoneChange(event.target.value)}
          onKeyDown={onPhoneKeyDown}
          inputRef={phoneInputRef}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#fff",
            },
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="Customer Address"
          placeholder="Enter customer address"
          value={customerAddress}
          onChange={(event) => onAddressChange(event.target.value)}
          onKeyDown={onAddressKeyDown}
          inputRef={addressInputRef}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#fff",
            },
          }}
        />
      </Grid>
    </>
  );
};

export default CustomerDetails;

