import { useMemo } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  Paper,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
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
  const normalize = (text = "") =>
    String(text)
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

  const selectedCustomer =
    customerOptions.find(
      (option) => normalize(option.name) === normalize(customerName),
    ) || null;

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
          (entry.phoneNumber || "").replace(/[^\d]/g, "").includes(numericQuery),
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
          `${(entry.name || "").toLowerCase()}|${(entry.phoneNumber || "").toLowerCase()}`,
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
          openOnFocus
          autoHighlight
          selectOnFocus
          clearOnBlur={false}
          handleHomeEndKeys
          noOptionsText="No customer found"
          options={smartOptions}
          value={selectedCustomer}
          inputValue={customerName}
          filterOptions={(options, state) => {
            const input = normalize(state.inputValue);
            const filtered = [...options];
            const exactMatch = filtered.some(
              (option) => normalize(option.name) === input,
            );

            if (input && !exactMatch) {
              filtered.push({
                name: `+ Add "${state.inputValue}"`,
                isNew: true,
              });
            }

            return filtered.slice(0, 10);
          }}
          getOptionLabel={(option) => (typeof option === "string" ? option : option.name || "")}
          isOptionEqualToValue={(option, value) =>
            normalize(option.name) === normalize(value.name)
          }
          onInputChange={(_, value, reason) => {
            if (reason === "input") onNameChange(value);
          }}
          onChange={(_, value) => {
            if (!value) return;
            if (typeof value === "string") {
              onNameChange(value);
              return;
            }

            if (value.isNew) {
              const cleanName = value.name.replace('+ Add "', "").replace('"', "");
              onNameChange(cleanName);
              onPhoneChange("");
              onAddressChange("");
              return;
            }

            onCustomerSelect(value);
          }}
          renderOption={(props, option) => (
            <Box
              component="li"
              {...props}
              sx={{ py: 1.1, px: 2, borderBottom: "1px solid #f1f1f1", alignItems: "flex-start" }}
            >
              {option.isNew ? (
                <Typography sx={{ fontWeight: 700, color: "primary.main" }}>
                  {option.name}
                </Typography>
              ) : (
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "15px" }}>{option.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    <PhoneIphoneRoundedIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "text-bottom" }} />
                    {option.phoneNumber || "No Phone"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <LocationOnRoundedIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "text-bottom" }} />
                    {option.address || "No Address"}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Customer Name"
              placeholder="Search by name, phone or address..."
              helperText={`${customerOptions.length} customers available`}
              fullWidth
              inputRef={nameInputRef}
              onKeyDown={onNameKeyDown}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  backgroundColor: "#fff",
                  fontSize: "16px",
                },
              }}
            />
          )}
        />
        {typoSuggestions.length ? (
          <Paper
            elevation={8}
            sx={{
              position: "absolute",
              left: 12,
              right: 12,
              top: "calc(100% + 6px)",
              zIndex: 1400,
              p: 1,
              borderRadius: 2,
              border: "1px solid rgba(148, 163, 184, 0.28)",
              backgroundColor: "rgba(255,255,255,0.98)",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
                Did you mean:
              </Typography>
              {typoSuggestions.map((name) => (
                <Chip
                  key={`suggest-${name}`}
                  size="small"
                  label={name}
                  onClick={() => onNameChange(name)}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Stack>
          </Paper>
        ) : null}
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="Customer Phone"
          placeholder="Enter customer phone"
          value={customerPhone}
          onChange={(event) => onPhoneChange(event.target.value)}
          onKeyDown={onPhoneKeyDown}
          inputRef={phoneInputRef}
          fullWidth
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", backgroundColor: "#fff" } }}
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
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", backgroundColor: "#fff" } }}
        />
      </Grid>
    </>
  );
};

export default CustomerDetails;
