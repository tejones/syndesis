/*
 * Copyright (C) 2016 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.syndesis.runtime.connector;

import io.syndesis.connector.generator.ConnectorGenerator;
import io.syndesis.connector.generator.swagger.SwaggerUnifiedShapeConnectorGenerator;
import io.syndesis.model.Violation;
import io.syndesis.model.action.ActionsSummary;
import io.syndesis.model.connection.ConfigurationProperty;
import io.syndesis.model.connection.Connector;
import io.syndesis.model.connection.ConnectorGroup;
import io.syndesis.model.connection.ConnectorSettings;
import io.syndesis.model.connection.ConnectorSummary;
import io.syndesis.model.connection.ConnectorTemplate;
import io.syndesis.model.icon.Icon;
import io.syndesis.runtime.BaseITCase;
import okio.Okio;
import org.junit.Before;
import org.junit.Test;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.IOException;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.assertThat;

@ContextConfiguration
public class CustomSwaggerConnectorITCase extends BaseITCase {

    private static final String TEMPLATE_ID = "connector-template";

    private final ConnectorTemplate template = createConnectorTemplate(TEMPLATE_ID, "connector template");

    @Configuration
    public static class TestConfiguration {
        private static final ActionsSummary ACTIONS_SUMMARY = new ActionsSummary.Builder().totalActions(5)
            .putActionCountByTag("updating", 1)
            .putActionCountByTag("creating", 1)
            .putActionCountByTag("fetching", 2)
            .putActionCountByTag("destruction", 1)
            .putActionCountByTag("tasks", 5)
            .build();

        private static final ConfigurationProperty PROPERTY_1 = new ConfigurationProperty.Builder().displayName("Property 1").build();

        @Bean(TEMPLATE_ID)
        public ConnectorGenerator swaggerConnectorGenerator() {
            return new SwaggerUnifiedShapeConnectorGenerator();
        }
    }

    @Before
    public void createConnectorTemplates() {
        dataManager.create(template);
    }

    private static ConnectorTemplate createConnectorTemplate(final String id, final String name) {
        return new ConnectorTemplate.Builder()//
            .id(id)//
            .name(name)//
            .build();
    }

    @Test
    public void shouldOfferCustomConnectorInfoForUploadedSwagger() throws IOException {
        final ConnectorSettings connectorSettings = new ConnectorSettings.Builder().connectorTemplateId(TEMPLATE_ID).build();

        final ResponseEntity<ConnectorSummary> response = post("/api/v1/connectors/custom/info",
            multipartBodyForInfo(
                connectorSettings,
                getClass().getResourceAsStream("/io/syndesis/runtime/test-swagger.json")
            ),
            ConnectorSummary.class,
            tokenRule.validToken(),
            HttpStatus.OK,
            multipartHeaders());

        final ConnectorSummary expected = new ConnectorSummary.Builder()// \
            .name("Todo App API")//
            .description("unspecified")//
            .actionsSummary(TestConfiguration.ACTIONS_SUMMARY)//
            .addWarning(new Violation.Builder().error("missing-response-schema").message("Operation DELETE /api/{id} does not provide a response schema for code 204").build())
            .build();

        ConnectorSummary got = response.getBody();

        assertThat(got).isEqualTo(expected);
    }

    private HttpHeaders multipartHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        return headers;
    }

    private MultiValueMap<String, Object> multipartBodyForInfo(ConnectorSettings connectorSettings, InputStream is) throws IOException {
        LinkedMultiValueMap<String, Object> multipartData = new LinkedMultiValueMap<>();
        multipartData.add("connectorSettings", connectorSettings);
        multipartData.add("swaggerSpecification", Okio.buffer(Okio.source(is)).readUtf8());
        return multipartData;
    }
}
